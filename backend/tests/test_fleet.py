import uuid
import pytest
from fastapi.testclient import TestClient

from tests.test_reports import (
    client,
    override_dependencies,
    mock_email,
    create_test_tables,
    _auth,
    _create_user_directly,
)

def test_create_team(client: TestClient) -> None:
    officer_id, officer_token = _create_user_directly(role="officer")
    payload = {"name": "Test Team", "category": "cleaning", "active": True}
    resp = client.post("/api/v1/teams/", json=payload, headers=_auth(officer_token))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Team"

def test_create_vehicle(client: TestClient) -> None:
    officer_id, officer_token = _create_user_directly(role="officer")
    payload = {"plate_number": "KA-01-1234", "type": "truck", "active": True}
    resp = client.post("/api/v1/vehicles/", json=payload, headers=_auth(officer_token))
    assert resp.status_code == 200
    assert resp.json()["plate_number"] == "KA-01-1234"

def test_citizen_cannot_create_team(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    payload = {"name": "Test Team 2", "category": "cleaning", "active": True}
    resp = client.post("/api/v1/teams/", json=payload, headers=_auth(citizen_token))
    assert resp.status_code == 403

def test_resolve_report(client: TestClient) -> None:
    # Set up
    officer_id, officer_token = _create_user_directly(role="officer")
    
    # Create report
    report_resp = client.post(
        "/api/v1/reports/",
        json={"description": "Test", "latitude": 12.0, "longitude": 77.0},
        headers=_auth(officer_token)
    )
    report_id = report_resp.json()["id"]

    # Transition to analyzing
    client.post(f"/api/v1/reports/{report_id}/status", json={"new_status": "analyzing"}, headers=_auth(officer_token))
    # Transition to assigned
    client.post(f"/api/v1/reports/{report_id}/status", json={"new_status": "assigned"}, headers=_auth(officer_token))
    # Transition to in_progress
    client.post(f"/api/v1/reports/{report_id}/status", json={"new_status": "in_progress"}, headers=_auth(officer_token))
    
    # Resolve
    resolve_resp = client.post(
        f"/api/v1/reports/{report_id}/resolve",
        json={"after_image_url": "http://example.com/after.jpg", "resolution_notes": "All clean"},
        headers=_auth(officer_token)
    )
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["status"] == "completed"
    
    # Verify report status is updated
    get_resp = client.get(f"/api/v1/reports/{report_id}", headers=_auth(officer_token))
    assert get_resp.json()["status"] == "completed"
    assert get_resp.json()["after_image_url"] == "http://example.com/after.jpg"
