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

def test_reassign_report(client: TestClient) -> None:
    # 1. Create a team
    officer_id, officer_token = _create_user_directly(role="officer")
    team1_resp = client.post("/api/v1/teams/", json={"name": "Team A", "category": "cleaning", "active": True}, headers=_auth(officer_token))
    team1_id = team1_resp.json()["id"]
    
    team2_resp = client.post("/api/v1/teams/", json={"name": "Team B", "category": "cleaning", "active": True}, headers=_auth(officer_token))
    team2_id = team2_resp.json()["id"]

    import random
    lat = round(random.uniform(-90.0, 90.0), 6)
    lon = round(random.uniform(-180.0, 180.0), 6)
    # 2. Create report and transition to analyzing
    report_resp = client.post("/api/v1/reports/", json={"description": "Test", "latitude": lat, "longitude": lon}, headers=_auth(officer_token))
    report_id = report_resp.json()["id"]
    client.post(f"/api/v1/reports/{report_id}/status", json={"new_status": "analyzing"}, headers=_auth(officer_token))

    # 3. Assign to Team A (transitions to assigned)
    assign1_resp = client.post(f"/api/v1/reports/{report_id}/assign", json={"assigned_team_id": team1_id}, headers=_auth(officer_token))
    assert assign1_resp.status_code == 200

    # 4. Reassign to Team B (should NOT fail, transitions assigned -> assigned)
    assign2_resp = client.post(f"/api/v1/reports/{report_id}/assign", json={"assigned_team_id": team2_id}, headers=_auth(officer_token))
    assert assign2_resp.status_code == 200

    # 5. Verify the report's assigned team is now Team B
    get_resp = client.get(f"/api/v1/reports/{report_id}", headers=_auth(officer_token))
    assert get_resp.json()["assigned_team_id"] == team2_id
