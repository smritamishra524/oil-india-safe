"""
OIL India Safe-X: Automated ML Test Suite
Covers:
1. Model loading & bundle validation
2. Real-world new-report inference
3. Empty / whitespace-only inputs
4. Short / insufficient text handling
5. Confidence thresholds & uncertainty flagging
6. Multi-target consistency (hazard, SIF potential, precursor)
7. Evidence extraction matching input report text
8. FastAPI endpoints (/health, /metrics, /predict, /analyze)
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml_service.inference import SafetyMLInferenceEngine
from ml_service.app import app

@pytest.fixture(scope="module")
def engine():
    return SafetyMLInferenceEngine()

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

# -------------------------------------------------------------
# 1. Engine & Model Loading Tests
# -------------------------------------------------------------
def test_model_loading(engine):
    assert engine.bundle is not None
    assert engine.vectorizer is not None
    assert "hazard" in engine.models
    assert "sif_precursor" in engine.models
    assert "report_type" in engine.models
    assert "sif_potential" in engine.models
    assert "severity" in engine.models
    assert len(engine.vectorizer.vocabulary_) > 100

def test_classes_exist(engine):
    hazard_classes = list(engine.models["hazard"].classes_)
    assert "Fall from Height" in hazard_classes
    assert "Hydrocarbon Gas Release" in hazard_classes
    assert "Stored / Residual Energy" in hazard_classes
    assert "Hydrogen Sulfide (H2S)" in hazard_classes

# -------------------------------------------------------------
# 2. Real-Report Inference & Evidence Extraction Tests
# -------------------------------------------------------------
def test_work_at_height_inference(engine):
    text = "Derrick technician observed working 24 meters high on monkey board with unhooked harness lanyard during high wind gusts."
    res = engine.predict(text)
    assert res["success"] is True
    assert res["predictions"]["hazard"] == "Fall from Height"
    assert res["predictions"]["sif_precursor"] == "Failed Fall Protection"
    assert len(res["evidence"]) > 0
    # Verbatim match check
    assert any(sentence in text for sentence in res["evidence"])

def test_gas_release_inference(engine):
    text = "Separator vessel gas outlet flange blew out packing seal releasing high volume methane cloud with detector reading 60% LEL."
    res = engine.predict(text)
    assert res["success"] is True
    assert res["predictions"]["hazard"] == "Hydrocarbon Gas Release"
    assert res["predictions"]["sif_precursor"] == "Uncontained Hydrocarbon Leakage"

def test_stored_energy_inference(engine):
    text = "During night shift maintenance on wellhead master valve, line was closed but not depressurized; residual pressure of 45 psi remained in the line without zero-energy verification."
    res = engine.predict(text)
    assert res["success"] is True
    assert res["predictions"]["hazard"] == "Stored / Residual Energy"
    assert res["predictions"]["sif_precursor"] == "Energy Isolation Failure"

def test_h2s_toxic_inference(engine):
    text = "Sour crude sampling operation encountered dangerous H2S concentration of 50 ppm near wellhead cellar; fixed sensor triggered alarm."
    res = engine.predict(text)
    assert res["success"] is True
    assert res["predictions"]["hazard"] == "Hydrogen Sulfide (H2S)"
    assert res["predictions"]["sif_precursor"] == "Toxic Atmosphere Exposure"

# -------------------------------------------------------------
# 3. Uncertainty & Empty / Invalid Input Tests
# -------------------------------------------------------------
def test_empty_input_handling(engine):
    res = engine.predict("")
    assert res["success"] is False
    assert res["review_needed"] is True
    assert "empty" in res["uncertainty_reason"].lower()

def test_whitespace_only_handling(engine):
    res = engine.predict("   \n\t  ")
    assert res["success"] is False
    assert res["review_needed"] is True
    assert "empty" in res["uncertainty_reason"].lower()

def test_too_short_input_handling(engine):
    res = engine.predict("valve broken")
    assert res["success"] is False
    assert res["review_needed"] is True
    assert "short" in res["uncertainty_reason"].lower()

def test_confidence_threshold_flagging(engine):
    # An ambiguous/nonspecific sentence that should trigger review_needed if threshold is high
    res = engine.predict("Someone noticed an unusual noise near the workshop perimeter yesterday afternoon.", min_confidence_threshold=0.80)
    assert res["review_needed"] is True
    assert res["uncertainty_reason"] is not None

# -------------------------------------------------------------
# 4. FastAPI Endpoint Integration Tests
# -------------------------------------------------------------
def test_api_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "targets" in data

def test_api_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "targets" in data
    assert "hazard" in data["targets"]

def test_api_predict_endpoint(client):
    payload = {
        "text": "Roughneck caught between rotary table and high tension snubbing line during pipe pull."
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predictions" in data
    assert "evidence" in data

def test_api_analyze_endpoint(client):
    payload = {
        "text": "During night shift maintenance on wellhead master valve, line was closed but not depressurized; residual pressure of 45 psi remained in the line without zero-energy verification.",
        "installation": "Duliajan Central Field",
        "asset": "Workover Rig WOR-07"
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"].startswith("OIL-ML-")
    assert data["hazard"] == "Stored / Residual Energy"
    assert data["barrier"] == "Energy Isolation (LOTO)"
    assert data["isMlGenerated"] is True
