import os
import sys
import pytest

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi.testclient import TestClient
from ml_service.app import app

client = TestClient(app)

def test_auth_signin_valid_credentials():
    response = client.post("/api/auth/signin", json={
        "email": "rk.barua@oilindia.in",
        "password": "OilIndia@2026"
    })
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == "rk.barua@oilindia.in"
    assert data["user"]["role"] == "Chief HSE Manager"

def test_auth_signin_invalid_password():
    response = client.post("/api/auth/signin", json={
        "email": "rk.barua@oilindia.in",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401
    assert "detail" in response.json()

def test_auth_signin_nonexistent_user():
    response = client.post("/api/auth/signin", json={
        "email": "ghost.user@oilindia.in",
        "password": "OilIndia@2026"
    })
    assert response.status_code == 401

def test_auth_signin_empty_fields():
    response = client.post("/api/auth/signin", json={
        "email": "",
        "password": ""
    })
    assert response.status_code == 400

def test_auth_session_verification():
    # 1. Sign in
    login_res = client.post("/api/auth/signin", json={
        "email": "evaluator@oilindia.in",
        "password": "OilIndia@2026"
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    # 2. Get session
    session_res = client.get("/api/auth/session", headers={
        "Authorization": f"Bearer {token}"
    })
    assert session_res.status_code == 200
    assert session_res.json()["user"]["email"] == "evaluator@oilindia.in"

    # 3. Invalid token
    bad_res = client.get("/api/auth/session", headers={
        "Authorization": "Bearer invalid_token_123"
    })
    assert bad_res.status_code == 401

def test_auth_signup_flow():
    test_email = f"test.safety.{pytest.__version__.replace('.', '')}@oilindia.in"
    signup_res = client.post("/api/auth/signup", json={
        "name": "Arunabh Phukan",
        "email": test_email,
        "password": "SafePassword@2026",
        "role": "Senior Drilling Engineer",
        "organization": "Oil India Limited (Moran Field)"
    })
    assert signup_res.status_code == 200
    data = signup_res.json()
    assert data["user"]["email"] == test_email
    assert data["user"]["role"] == "Senior Drilling Engineer"

    # Verify new user can sign in with PBKDF2 hash
    login_res = client.post("/api/auth/signin", json={
        "email": test_email,
        "password": "SafePassword@2026"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["name"] == "Arunabh Phukan"

def test_cmms_and_autopilot_endpoints():
    # Test CMMS tasks list
    cmms_res = client.get("/api/cmms/tasks")
    assert cmms_res.status_code == 200
    assert "tasks" in cmms_res.json()

    # Test Autopilot status
    status_res = client.get("/api/autopilot/status")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "ready"

    # Test Autopilot audit log
    audit_res = client.get("/api/autopilot/audit-log")
    assert audit_res.status_code == 200
    assert "logs" in audit_res.json()
