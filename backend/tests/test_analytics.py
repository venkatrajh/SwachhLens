import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.models.report import Report
from app.models.report_status_history import ReportStatusHistory
from tests.test_reports import (
    client,
    override_dependencies,
    mock_email,
    create_test_tables,
    _auth,
    _create_user_directly,
    TestSessionLocal
)

def test_empty_analytics(client: TestClient) -> None:
    officer_id, officer_token = _create_user_directly(role="officer")
    
    # Use a date far in the future to ensure 0 reports even if other tests seeded data
    resp = client.get("/api/v1/analytics/summary?start_date=2099-01-01T00:00:00Z", headers=_auth(officer_token))
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_reports"] == 0
    assert data["hazardous_count"] == 0

async def seed_reports():
    async with TestSessionLocal() as db:
        user_id = uuid.uuid4()
        # Use year 2030 to isolate these reports
        base_time = datetime(2030, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
        
        # Add a mix of reports
        r1 = Report(id=uuid.uuid4(), user_id=user_id, status="pending", priority="low", waste_type="organic", is_hazardous=False, is_recyclable=True, duplicate=False, reported_at=base_time)
        r2 = Report(id=uuid.uuid4(), user_id=user_id, status="completed", priority="high", waste_type="plastic", is_hazardous=True, is_recyclable=False, duplicate=False, reported_at=base_time + timedelta(days=1))
        r3 = Report(id=uuid.uuid4(), user_id=user_id, status="assigned", priority="medium", waste_type="organic", is_hazardous=False, is_recyclable=False, duplicate=True, reported_at=base_time + timedelta(days=2))
        
        db.add_all([r1, r2, r3])
        
        # Add history for completion
        h1 = ReportStatusHistory(id=uuid.uuid4(), report_id=r2.id, status="completed", label="Done", occurred_at=base_time + timedelta(days=1, hours=2))
        db.add(h1)
        
        await db.commit()

import asyncio

def test_summary_with_data(client: TestClient) -> None:
    asyncio.run(seed_reports())
    
    officer_id, officer_token = _create_user_directly(role="officer")
    # Filter by the 2030 window
    resp = client.get("/api/v1/analytics/summary?start_date=2030-01-01T00:00:00Z&end_date=2030-12-31T23:59:59Z", headers=_auth(officer_token))
    assert resp.status_code == 200
    data = resp.json()
    
    assert data["total_reports"] == 3
    assert data["status_counts"]["pending"] == 1
    assert data["status_counts"]["completed"] == 1
    assert data["status_counts"]["assigned"] == 1
    
    assert data["priority_counts"]["low"] == 1
    assert data["priority_counts"]["medium"] == 1
    assert data["priority_counts"]["high"] == 1
    
    assert data["waste_type_counts"]["organic"] == 2
    assert data["waste_type_counts"]["plastic"] == 1
    
    assert data["hazardous_count"] == 1
    assert data["recyclable_count"] == 1
    assert data["duplicate_count"] == 1

def test_performance_calculation(client: TestClient) -> None:
    # Requires seed_reports above to have run
    officer_id, officer_token = _create_user_directly(role="officer")
    resp = client.get("/api/v1/analytics/performance?start_date=2030-01-01T00:00:00Z&end_date=2030-12-31T23:59:59Z", headers=_auth(officer_token))
    assert resp.status_code == 200
    data = resp.json()
    
    # R2 completed in exactly 2 hours (7200 seconds)
    assert data["completed_report_count"] == 1
    assert data["average_resolution_duration_seconds"] == 7200.0
    assert data["verified_report_count"] == 0
    assert data["pending_resolution_count"] == 2

def test_fleet_workload(client: TestClient) -> None:
    officer_id, officer_token = _create_user_directly(role="officer")
    resp = client.get("/api/v1/analytics/fleet", headers=_auth(officer_token))
    assert resp.status_code == 200
    data = resp.json()
    
    # Based on DB state
    assert "total_teams" in data
    assert "active_teams" in data
    assert "team_workload" in data
    assert "vehicle_workload" in data

def test_trends(client: TestClient) -> None:
    officer_id, officer_token = _create_user_directly(role="officer")
    
    resp_day = client.get("/api/v1/analytics/trends?interval=day", headers=_auth(officer_token))
    assert resp_day.status_code == 200
    assert "trends" in resp_day.json()
    
    resp_month = client.get("/api/v1/analytics/trends?interval=month", headers=_auth(officer_token))
    assert resp_month.status_code == 200
    
    resp_week = client.get("/api/v1/analytics/trends?interval=week", headers=_auth(officer_token))
    assert resp_week.status_code == 200

def test_citizen_forbidden(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    
    endpoints = [
        "/api/v1/analytics/summary",
        "/api/v1/analytics/fleet",
        "/api/v1/analytics/performance",
        "/api/v1/analytics/trends"
    ]
    
    for ep in endpoints:
        resp = client.get(ep, headers=_auth(citizen_token))
        assert resp.status_code == 403

def test_commissioner_access(client: TestClient) -> None:
    comm_id, comm_token = _create_user_directly(role="commissioner")
    resp = client.get("/api/v1/analytics/summary", headers=_auth(comm_token))
    assert resp.status_code == 200

def test_date_filtering(client: TestClient) -> None:
    officer_id, officer_token = _create_user_directly(role="officer")
    
    resp = client.get("/api/v1/analytics/summary?start_date=2099-01-01T00:00:00Z", headers=_auth(officer_token))
    assert resp.status_code == 200
    assert resp.json()["total_reports"] == 0
