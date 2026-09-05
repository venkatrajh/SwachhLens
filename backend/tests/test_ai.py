import uuid
from unittest.mock import AsyncMock

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.testclient import TestClient

from app.models.report import Report
from app.models.user import User
from app.schemas.ai import AIAnalysisResult
from app.services.ai import analyze_report_with_groq
from app.services.decision_engine import generate_recommendations
from tests.test_reports import client, create_test_tables, mock_email, override_dependencies

# Set a dummy key so the service doesn't return early
import os
os.environ["GROQ_API_KEY"] = "test-key"
from app.core.config import get_settings
get_settings.cache_clear()

# ── AI Service Tests ──────────────────────────────────────────────────────────

async def test_ai_valid_response(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "choices": [{
            "message": {
                "content": '''```json
{
  "waste_type": "construction",
  "volume_level": "large",
  "confidence": 0.95,
  "severity_score": 80.0,
  "estimated_weight_kg": 150.0,
  "is_hazardous": false,
  "is_recyclable": true,
  "recommended_action": "Clear rubble"
}
```'''
            }
        }]
    }
    mock_post.return_value = mock_response

    result = await analyze_report_with_groq("Test", "http://image")
    assert result is not None
    assert result.waste_type == "construction"
    assert result.volume_level == "large"
    assert result.confidence == 0.95


async def test_ai_invalid_enum(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "choices": [{"message": {"content": '{"volume_level": "gigantic", "confidence": 0.5, "severity_score": 10, "estimated_weight_kg": 10, "is_hazardous": false, "is_recyclable": false, "recommended_action": "test", "waste_type": "test"}'}}]
    }
    mock_post.return_value = mock_response
    result = await analyze_report_with_groq("Test", None)
    assert result is None  # Validation fails


async def test_ai_confidence_out_of_bounds(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "choices": [{"message": {"content": '{"volume_level": "small", "confidence": 1.5, "severity_score": 10, "estimated_weight_kg": 10, "is_hazardous": false, "is_recyclable": false, "recommended_action": "test", "waste_type": "test"}'}}]
    }
    mock_post.return_value = mock_response
    assert await analyze_report_with_groq("Test", None) is None


async def test_ai_negative_weight(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "choices": [{"message": {"content": '{"volume_level": "small", "confidence": 0.5, "severity_score": 10, "estimated_weight_kg": -5, "is_hazardous": false, "is_recyclable": false, "recommended_action": "test", "waste_type": "test"}'}}]
    }
    mock_post.return_value = mock_response
    assert await analyze_report_with_groq("Test", None) is None


async def test_ai_malformed_json(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.Mock()
    mock_response.raise_for_status.return_value = None
    mock_response.json.return_value = {
        "choices": [{"message": {"content": '{"volume_level": "small", '}}]
    }
    mock_post.return_value = mock_response
    assert await analyze_report_with_groq("Test", None) is None


async def test_ai_timeout(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("Timeout"))
    assert await analyze_report_with_groq("Test", None) is None


async def test_ai_http_error(mocker):
    mock_post = mocker.patch("httpx.AsyncClient.post")
    mock_response = mocker.Mock()
    mock_response.raise_for_status.side_effect = httpx.HTTPStatusError("Error", request=mocker.Mock(), response=mocker.Mock())
    mock_post.return_value = mock_response
    assert await analyze_report_with_groq("Test", None) is None


# ── Decision Engine Tests ─────────────────────────────────────────────────────

def test_decision_engine_hazardous():
    # Precedence: Hazardous > Recyclable
    ai_result = AIAnalysisResult(
        waste_type="medical", volume_level="small", confidence=0.9, severity_score=90, estimated_weight_kg=5, is_hazardous=True, is_recyclable=True, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "Hazardous Response Team"
    assert recs["recommended_vehicle"] == "Hazmat Truck"
    assert recs["priority"] == "critical"
    assert "Material flagged as hazardous" in recs["recommended_action"]
    assert "[Critical Priority] Medical waste identified" in recs["recommended_action"]


def test_decision_engine_heavy_by_volume():
    ai_result = AIAnalysisResult(
        waste_type="construction", volume_level="very_large", confidence=0.9, severity_score=75, estimated_weight_kg=400, is_hazardous=False, is_recyclable=False, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "Heavy Cleanup Crew"
    assert recs["recommended_vehicle"] == "Dump Truck"
    assert recs["priority"] == "high"


def test_decision_engine_heavy_by_weight():
    ai_result = AIAnalysisResult(
        waste_type="construction", volume_level="large", confidence=0.9, severity_score=75, estimated_weight_kg=500, is_hazardous=False, is_recyclable=False, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "Heavy Cleanup Crew"
    assert recs["recommended_vehicle"] == "Dump Truck"


def test_decision_engine_recyclable():
    ai_result = AIAnalysisResult(
        waste_type="plastic", volume_level="small", confidence=0.9, severity_score=10, estimated_weight_kg=5, is_hazardous=False, is_recyclable=True, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "Recycling Team"
    assert recs["recommended_vehicle"] == "Recycling Truck"
    assert recs["priority"] == "low"
    assert "Waste is fully recyclable" in recs["recommended_action"]


def test_decision_engine_standard_by_volume():
    ai_result = AIAnalysisResult(
        waste_type="household", volume_level="large", confidence=0.9, severity_score=40, estimated_weight_kg=50, is_hazardous=False, is_recyclable=False, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "Standard Cleanup Crew"
    assert recs["recommended_vehicle"] == "Standard Garbage Truck"
    assert recs["priority"] == "medium"


def test_decision_engine_standard_by_weight():
    ai_result = AIAnalysisResult(
        waste_type="household", volume_level="medium", confidence=0.9, severity_score=40, estimated_weight_kg=100, is_hazardous=False, is_recyclable=False, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "Standard Cleanup Crew"


def test_decision_engine_default_fallback():
    ai_result = AIAnalysisResult(
        waste_type="general", volume_level="small", confidence=0.9, severity_score=10, estimated_weight_kg=5, is_hazardous=False, is_recyclable=False, recommended_action=""
    )
    recs = generate_recommendations(ai_result)
    assert recs["recommended_team"] == "General Maintenance"
    assert recs["recommended_vehicle"] == "Light Pickup"
    assert recs["priority"] == "low"


def test_decision_engine_missing_fields():
    # Test missing weight, missing volume, missing waste type, missing severity
    class MockAIResult:
        waste_type = ""
        volume_level = ""
        severity_score = None
        estimated_weight_kg = None
        is_hazardous = False
        is_recyclable = False

    ai_result = MockAIResult()
    recs = generate_recommendations(ai_result) # type: ignore
    assert recs["priority"] == "low" # Defaults to 0.0 -> low
    assert recs["recommended_team"] == "General Maintenance"
    action = recs["recommended_action"]
    assert "[Low Priority] Unclassified waste identified" in action
    assert "Volume: unknown)" in action # No weight string
    assert "Severity: 0.0/100" in action


def test_decision_engine_priority_boundaries():
    def get_priority(score):
        return generate_recommendations(AIAnalysisResult(
            waste_type="x", volume_level="small", confidence=0.9, severity_score=score, estimated_weight_kg=5, is_hazardous=False, is_recyclable=False, recommended_action=""
        ))["priority"]

    assert get_priority(0.0) == "low"
    assert get_priority(29.9) == "low"
    assert get_priority(30.0) == "medium"
    assert get_priority(59.9) == "medium"
    assert get_priority(60.0) == "high"
    assert get_priority(79.9) == "high"
    assert get_priority(80.0) == "critical"
    assert get_priority(100.0) == "critical"




# ── API Endpoint Tests ────────────────────────────────────────────────────────

from tests.test_reports import _create_user_directly, _auth, _create_report_payload

def test_analyze_unauthenticated(client: TestClient):
    resp = client.post("/api/v1/reports/00000000-0000-0000-0000-000000000000/analyze")
    assert resp.status_code == 401


def test_analyze_citizen_forbidden(client: TestClient):
    _, token = _create_user_directly(role="citizen")
    resp = client.post("/api/v1/reports/00000000-0000-0000-0000-000000000000/analyze", headers=_auth(token))
    assert resp.status_code == 403


def test_analyze_not_found(client: TestClient):
    _, token = _create_user_directly(role="officer")
    resp = client.post("/api/v1/reports/00000000-0000-0000-0000-000000000000/analyze", headers=_auth(token))
    assert resp.status_code == 404


def _create_report_via_api(client: TestClient, token: str, **overrides) -> dict:
    payload = _create_report_payload(**overrides)
    r = client.post("/api/v1/reports", json=payload, headers=_auth(token))
    assert r.status_code == 201
    return r.json()

def test_analyze_success(client: TestClient, mocker):
    _, token = _create_user_directly(role="officer")
    
    # Mock AI response
    mocker.patch(
        "app.services.report.analyze_report_with_groq",
        return_value=AIAnalysisResult(
            waste_type="electronics", volume_level="medium", confidence=0.8, severity_score=30, estimated_weight_kg=20, is_hazardous=False, is_recyclable=True, recommended_action="Recycle it"
        )
    )
    # Mock duplicate to None
    mocker.patch("app.services.report.find_duplicate_report", return_value=None)
    
    report = _create_report_via_api(client, token)

    resp = client.post(f"/api/v1/reports/{report['id']}/analyze", headers=_auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "analyzing"
    assert data["waste_type"] == "electronics"
    assert data["confidence"] == 0.8
    assert data["recommended_team"] == "Recycling Team"


def test_analyze_duplicate_flow(client: TestClient, mocker):
    _, token = _create_user_directly(role="officer")
    
    # To test duplicate flow during /analyze, we need it to NOT be duplicate during creation.
    mocker.patch("app.services.report.analyze_report_with_groq", return_value=None)
    mocker.patch("app.services.report.find_duplicate_report", return_value=None)
    report = _create_report_via_api(client, token)

    mock_dup = Report(id=uuid.uuid4())
    mocker.patch("app.services.report.find_duplicate_report", return_value=mock_dup)

    resp = client.post(f"/api/v1/reports/{report['id']}/analyze", headers=_auth(token))
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "duplicate"
    assert data["duplicate"] is True
    assert data["linked_report_id"] == str(mock_dup.id)


def test_analyze_ai_failure(client: TestClient, mocker):
    _, token = _create_user_directly(role="officer")
    
    mocker.patch("app.services.report.find_duplicate_report", return_value=None)
    mocker.patch("app.services.report.analyze_report_with_groq", return_value=None)
    
    report = _create_report_via_api(client, token)

    resp = client.post(f"/api/v1/reports/{report['id']}/analyze", headers=_auth(token))
    assert resp.status_code == 502

    get_resp = client.get(f"/api/v1/reports/{report['id']}", headers=_auth(token))
    assert get_resp.json()["status"] in ("pending", "analyzing")


async def test_ai_handles_no_description_and_no_image(mocker):
    # Just to add coverage
    mock_post = mocker.patch('httpx.AsyncClient.post')
    mock_post.side_effect = Exception('Unexpected')
    res = await analyze_report_with_groq(None, None)
    assert res is None
