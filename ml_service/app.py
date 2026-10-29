"""
OIL India Safe-X: FastAPI ML Inference Service
Provides production endpoints for real-time safety text classification,
evidence extraction, and held-out model evaluation metrics.
"""

import os
import sys
import json
import time
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# Ensure project root is in path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

DIST_DIR = os.path.join(PROJECT_ROOT, "dist")

from ml_service.inference import SafetyMLInferenceEngine
from ml_service.api_router import router as api_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    try:
        engine = SafetyMLInferenceEngine()
    except Exception as e:
        print(f"[ERROR] Failed to load ML model: {e}")
        engine = None
    yield

app = FastAPI(
    title="OIL India Safe-X ML Intelligence API",
    description="Real text-classification model for hazardous events, SIF precursors, and evidence extraction.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://oil-india-safe.vercel.app",
        "https://oil-india-safe.onrender.com",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication, CMMS and Autopilot router
app.include_router(api_router)

# Mount static assets directory if Vite build exists
assets_dir = os.path.join(DIST_DIR, "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

START_TIME = time.time()

class PredictRequest(BaseModel):
    text: str = Field(..., description="Report narrative text to analyze")
    min_confidence_threshold: Optional[float] = Field(0.35, description="Operational uncertainty threshold (0.0 to 1.0)")

class AnalyzeRequest(BaseModel):
    text: str = Field(..., description="Report narrative text")
    installation: Optional[str] = Field("Duliajan Central Field", description="Installation location name")
    asset: Optional[str] = Field(None, description="Asset or equipment tag name")
    report_type: Optional[str] = Field(None, description="Optional manual hint for report type")

@app.get("/api")
def api_info():
    return {
        "service": "OIL India Safe-X Machine Learning Service",
        "status": "online",
        "version": engine.version if engine else "unavailable",
        "endpoints": ["/health", "/metrics", "/predict", "/analyze"]
    }

@app.get("/")
def root():
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    return {
        "service": "OIL India Safe-X Machine Learning Service",
        "status": "online",
        "version": engine.version if engine else "unavailable",
        "endpoints": ["/health", "/metrics", "/predict", "/analyze"]
    }

@app.get("/health")
def health():
    if not engine:
        raise HTTPException(status_code=503, detail="ML model is not loaded or failed to initialize.")
    return {
        "status": "healthy",
        "model_version": engine.version,
        "uptime_seconds": int(time.time() - START_TIME),
        "targets": list(engine.models.keys()),
        "classes": {k: [str(c) for c in m.classes_] for k, m in engine.models.items()}
    }

@app.get("/metrics")
def metrics():
    if not engine:
        raise HTTPException(status_code=503, detail="ML model is not loaded.")
    metrics_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", engine.version, "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return engine.metrics or {"message": "Metrics not found"}

@app.post("/predict")
def predict(req: PredictRequest):
    if not engine:
        raise HTTPException(status_code=503, detail="ML model is not loaded.")
    
    threshold = req.min_confidence_threshold if req.min_confidence_threshold is not None else 0.35
    result = engine.predict(req.text, min_confidence_threshold=threshold)
    return result

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    if not engine:
        raise HTTPException(status_code=503, detail="ML model is not loaded.")
    
    result = engine.analyze_report(
        text=req.text,
        installation=req.installation,
        asset=req.asset,
        report_type_hint=req.report_type
    )
    return result

@app.get("/{full_path:path}")
async def serve_spa_or_file(full_path: str):
    reserved_prefixes = ["health", "metrics", "predict", "analyze", "docs", "openapi.json", "redoc", "api"]
    first_segment = full_path.split("/")[0]
    if first_segment in reserved_prefixes:
        raise HTTPException(status_code=404, detail="Not Found")

    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Resource Not Found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting OIL India Safe-X ML API on port {port}...")
    uvicorn.run("ml_service.app:app", host="0.0.0.0", port=port, reload=False)
