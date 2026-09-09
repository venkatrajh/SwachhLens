"""
Phase 2A Core Report Pipeline Backend Tests.

Validates:
1. Report creation succeeds with valid initial state.
2. POST /reports automatically invokes analysis.
3. Automatic transition pending -> analyzing on successful analysis.
4. AI analysis result persistence (waste_type, severity, confidence, etc.).
5. Deterministic decision engine execution (priority, recommendations).
6. Non-duplicate report reaching correct state.
7. Automatic duplicate detection and duplicate marking.
8. Duplicate links to original report and avoids assignment.
9. Duplicate status history (Submitted -> Analyzing -> Duplicate).
10. AI/Groq failure does not delete citizen report (remains pending & recoverable).
11. AI failure still returns 201 Created.
12. Manual re-analysis by officer recovers pending/failed reports.
13. Invalid lifecycle transitions rejected.
14. Status history records accuracy and ordering.
15. Citizen authorization rules enforced (cannot trigger manual analysis, cannot view others).
"""

from __future__ import annotations

import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.models.report import Report
from app.models.report_status_history import ReportStatusHistory
from app.schemas.ai import AIAnalysisResult
from tests.test_reports import (
    TestSessionLocal,
    _auth,
    _create_report_payload,
    _create_team_directly,
    _create_user_directly,
    _create_vehicle_directly,
    client,
    create_test_tables,
    mock_email,
    override_dependencies,
)


class TestCoreReportPipeline:
    """Covers all Phase 2A functional requirements."""

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_automatic_analysis_success(
        self, mock_groq: MagicMock, client: TestClient
    ) -> None:
        """Citizen creates report; backend automatically runs AI analysis & decision engine."""
        mock_groq.return_value = AIAnalysisResult(
            waste_type="plastic",
            volume_level="large",
            confidence=0.92,
            severity_score=65.0,
            estimated_weight_kg=80.0,
            is_hazardous=False,
            is_recyclable=True,
            recommended_action="Collect and recycle plastic debris",
        )

        _, token = _create_user_directly(role="citizen")
        payload = _create_report_payload(
            description="Large pile of discarded plastic bottles near the canal",
            waste_type=None,
            latitude=12.9352,
            longitude=77.6245,
        )

        resp = client.post("/api/v1/reports", json=payload, headers=_auth(token))
        assert resp.status_code == 201
        data = resp.json()

        # 1. Automatic analysis transitioned to analyzing
        assert data["status"] == "analyzing"
        assert data["progress"] == 10

        # 2. AI fields persisted
        assert data["waste_type"] == "plastic"
        assert data["volume_level"] == "large"
        assert data["confidence"] == 0.92
        assert data["severity_score"] == 65.0
        assert data["estimated_weight_kg"] == 80.0
        assert data["is_hazardous"] is False
        assert data["is_recyclable"] is True

        # 3. Decision engine recommendations persisted
        assert data["priority"] == "high"  # severity 65 is high (60-80)
        assert data["recommended_team"] == "Recycling Team"
        assert data["recommended_vehicle"] == "Recycling Truck"
        assert "Recycling Team" in data["recommended_action"]

        # 4. Status history contains Submitted -> Analyzing
        history_resp = client.get(f"/api/v1/reports/{data['id']}/history", headers=_auth(token))
        assert history_resp.status_code == 200
        history = history_resp.json()
        assert len(history) == 2
        assert history[0]["status"] == "pending"
        assert history[0]["label"] == "Report submitted"
        assert history[1]["status"] == "analyzing"
        assert history[1]["label"] == "AI analysis completed"

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_ai_failure_safe_degradation(
        self, mock_groq: MagicMock, client: TestClient
    ) -> None:
        """P0: If AI fails, the report is NOT deleted; creation succeeds (201) and stays pending."""
        mock_groq.return_value = None  # Simulates Groq failure

        _, token = _create_user_directly(role="citizen")
        payload = _create_report_payload(
            description="Unanalyzed report because AI is down",
            latitude=13.0827,
            longitude=80.2707,
        )

        resp = client.post("/api/v1/reports", json=payload, headers=_auth(token))
        assert resp.status_code == 201
        data = resp.json()
        report_id = data["id"]

        # Report is safely saved with status pending
        assert data["status"] == "pending"
        assert data["priority"] == "medium"
        assert data["confidence"] == 0.0

        # Verify report can be fetched and still exists in DB
        get_resp = client.get(f"/api/v1/reports/{report_id}", headers=_auth(token))
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == report_id
        assert get_resp.json()["status"] == "pending"

        # Verify status history has initial pending entry
        history_resp = client.get(f"/api/v1/reports/{report_id}/history", headers=_auth(token))
        assert history_resp.status_code == 200
        history = history_resp.json()
        assert len(history) == 1
        assert history[0]["status"] == "pending"

    @patch("app.services.report.analyze_report_with_groq")
    def test_manual_reanalyze_recovers_failed_report(
        self, mock_groq: MagicMock, client: TestClient
    ) -> None:
        """An officer can trigger manual re-analysis to recover a report after initial AI failure."""
        mock_groq.return_value = None
        _, citizen_token = _create_user_directly(role="citizen")
        _, officer_token = _create_user_directly(role="officer")

        # Initial creation fails AI
        payload = _create_report_payload(description="Broken furniture on sidewalk")
        created = client.post("/api/v1/reports", json=payload, headers=_auth(citizen_token)).json()
        report_id = created["id"]
        assert created["status"] == "pending"

        # Now AI is back online
        mock_groq.return_value = AIAnalysisResult(
            waste_type="construction",
            volume_level="medium",
            confidence=0.88,
            severity_score=45.0,
            estimated_weight_kg=60.0,
            is_hazardous=False,
            is_recyclable=False,
            recommended_action="Dispatch maintenance truck",
        )

        # Officer triggers re-analysis
        analyze_resp = client.post(
            f"/api/v1/reports/{report_id}/analyze", headers=_auth(officer_token)
        )
        assert analyze_resp.status_code == 200
        data = analyze_resp.json()
        assert data["status"] == "analyzing"
        assert data["waste_type"] == "construction"
        assert data["confidence"] == 0.88
        assert data["priority"] == "medium"
        assert data["recommended_team"] == "General Maintenance"

    @patch("app.services.report.analyze_report_with_groq")
    def test_automatic_duplicate_detection_flow(
        self, mock_groq: MagicMock, client: TestClient
    ) -> None:
        """A new report close to an existing recent report is automatically marked duplicate."""
        mock_groq.return_value = AIAnalysisResult(
            waste_type="organic",
            volume_level="medium",
            confidence=0.85,
            severity_score=35.0,
            estimated_weight_kg=25.0,
            is_hazardous=False,
            is_recyclable=False,
            recommended_action="Standard compost collection",
        )

        _, token1 = _create_user_directly(role="citizen", email="cit1@example.com")
        _, token2 = _create_user_directly(role="citizen", email="cit2@example.com")

        # 1. First report created at coordinates (12.9716, 77.5946)
        p1 = _create_report_payload(
            latitude=12.9716,
            longitude=77.5946,
            description="Organic food waste pile",
            waste_type="organic",
        )
        r1_resp = client.post("/api/v1/reports", json=p1, headers=_auth(token1))
        assert r1_resp.status_code == 201
        r1_id = r1_resp.json()["id"]

        # 2. Second report created at identical coordinates within minutes
        p2 = _create_report_payload(
            latitude=12.9716,
            longitude=77.5946,
            description="Same food waste pile reported by neighbor",
            waste_type="organic",
        )
        r2_resp = client.post("/api/v1/reports", json=p2, headers=_auth(token2))
        assert r2_resp.status_code == 201
        r2_data = r2_resp.json()

        # Should be automatically marked as duplicate
        assert r2_data["status"] == "duplicate"
        assert r2_data["duplicate"] is True
        assert r2_data["linked_report_id"] == r1_id

        # Status history contains Submitted -> Analyzing -> Duplicate
        history_resp = client.get(f"/api/v1/reports/{r2_data['id']}/history", headers=_auth(token2))
        assert history_resp.status_code == 200
        history = history_resp.json()
        assert len(history) == 3
        assert history[0]["status"] == "pending"
        assert history[1]["status"] == "analyzing"
        assert history[2]["status"] == "duplicate"
        assert f"Marked as duplicate of {r1_id}" in history[2]["label"]

    @patch("app.services.report.analyze_report_with_groq")
    def test_duplicate_cannot_be_reassigned_or_continue_pipeline(
        self, mock_groq: MagicMock, client: TestClient
    ) -> None:
        """Terminal duplicate state cannot transition or consume fleet resources."""
        mock_groq.return_value = AIAnalysisResult(
            waste_type="mixed",
            volume_level="small",
            confidence=0.8,
            severity_score=10.0,
            estimated_weight_kg=5.0,
            is_hazardous=False,
            is_recyclable=False,
            recommended_action="None",
        )

        _, citizen_token = _create_user_directly(role="citizen")
        _, officer_token = _create_user_directly(role="officer")

        p1 = _create_report_payload(latitude=15.0, longitude=75.0)
        client.post("/api/v1/reports", json=p1, headers=_auth(citizen_token))

        p2 = _create_report_payload(latitude=15.0, longitude=75.0)
        dup_report = client.post("/api/v1/reports", json=p2, headers=_auth(citizen_token)).json()
        assert dup_report["status"] == "duplicate"

        # Attempt to assign team to duplicate report must fail
        team_id = _create_team_directly()
        assign_resp = client.post(
            f"/api/v1/reports/{dup_report['id']}/assign",
            json={"assigned_team_id": team_id},
            headers=_auth(officer_token),
        )
        assert assign_resp.status_code == 400
        assert "terminal status 'duplicate'" in assign_resp.json()["detail"].lower()

    def test_citizen_cannot_trigger_manual_analyze(self, client: TestClient) -> None:
        """Citizens cannot trigger /analyze endpoint."""
        _, citizen_token = _create_user_directly(role="citizen")
        resp = client.post(
            f"/api/v1/reports/{uuid.uuid4()}/analyze", headers=_auth(citizen_token)
        )
        assert resp.status_code == 403

    def test_invalid_lifecycle_transition_rejected(self, client: TestClient) -> None:
        """Direct transition from pending to in_progress or completed is rejected."""
        _, citizen_token = _create_user_directly(role="citizen")
        _, officer_token = _create_user_directly(role="officer")

        with patch("app.services.report.analyze_report_with_groq", return_value=None):
            report = client.post(
                "/api/v1/reports", json=_create_report_payload(), headers=_auth(citizen_token)
            ).json()

        assert report["status"] == "pending"

        # Try to transition pending -> in_progress (invalid)
        resp = client.post(
            f"/api/v1/reports/{report['id']}/status",
            json={"new_status": "in_progress"},
            headers=_auth(officer_token),
        )
        assert resp.status_code == 400
        assert "invalid transition" in resp.json()["detail"].lower()
