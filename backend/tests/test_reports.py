"""
Phase 4 Report Workflow Tests.

Strategy
--------
- Uses in-memory SQLite (same pattern as test_auth.py).
- Brevo email service is mocked via dependency_overrides.
- Tests cover: CRUD, status transitions, RBAC, pagination/filtering,
  status history, assignment, and error handling.
- No real DB or Brevo calls.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.report import Report
from app.models.report_status_history import ReportStatusHistory
from app.models.team import Team
from app.models.user import User
from app.models.vehicle import Vehicle
from app.services.email import BrevoEmailService, get_email_service

# ── In-memory SQLite engine ──────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def _create_tables() -> None:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Session-scoped table creation ────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def create_test_tables() -> None:
    asyncio.run(_create_tables())


# ── Per-test dependency overrides ────────────────────────────────────────────

@pytest.fixture()
def mock_email() -> MagicMock:
    return MagicMock(spec=BrevoEmailService)


@pytest.fixture(autouse=True)
def override_dependencies(mock_email: MagicMock):
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_email_service] = lambda: mock_email
    with patch("app.services.report.analyze_report_with_groq", return_value=None):
        yield
    app.dependency_overrides.clear()


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app, raise_server_exceptions=True)


# ── Helper factories ─────────────────────────────────────────────────────────

def _unique_email(prefix: str = "rpt") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


def _create_user_directly(
    email: str | None = None,
    role: str = "citizen",
    name: str = "Test User",
) -> tuple[str, str]:
    """Create user directly in DB and return (user_id_str, token)."""
    email = email or _unique_email()
    user_id = uuid.uuid4()

    async def _insert():
        async with TestSessionLocal() as s:
            u = User(
                id=user_id,
                name=name,
                email=email,
                password_hash=hash_password("TestPass1!"),
                auth_provider="local",
                role=role,
                is_active=True,
                is_verified=True,
            )
            s.add(u)
            await s.commit()

    asyncio.run(_insert())
    token = create_access_token(
        subject=str(user_id),
        extra_claims={"role": role, "email": email},
    )
    return str(user_id), token


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


import random

def _create_report_payload(**overrides) -> dict:
    base = {
        "description": "Garbage pile near the park",
        "latitude": round(random.uniform(-90.0, 90.0), 6),
        "longitude": round(random.uniform(-180.0, 180.0), 6),
        "address_label": "123 Main St",
        "waste_type": "mixed",
        "volume_level": "medium",
    }
    base.update(overrides)
    return base


def _create_team_directly(name: str | None = None, active: bool = True) -> str:
    """Create a team in DB and return its UUID string."""
    team_id = uuid.uuid4()
    name = name or f"Team-{uuid.uuid4().hex[:6]}"

    async def _insert():
        async with TestSessionLocal() as s:
            t = Team(id=team_id, name=name, category="general", active=active)
            s.add(t)
            await s.commit()

    asyncio.run(_insert())
    return str(team_id)


def _create_vehicle_directly(plate: str | None = None, active: bool = True) -> str:
    """Create a vehicle in DB and return its UUID string."""
    vehicle_id = uuid.uuid4()
    plate = plate or f"KA-{uuid.uuid4().hex[:6].upper()}"

    async def _insert():
        async with TestSessionLocal() as s:
            v = Vehicle(id=vehicle_id, plate_number=plate, type="standard", active=active)
            s.add(v)
            await s.commit()

    asyncio.run(_insert())
    return str(vehicle_id)


def _create_report_via_api(client: TestClient, token: str, **overrides) -> dict:
    """Helper: create a report and return the response JSON."""
    r = client.post(
        "/api/v1/reports",
        json=_create_report_payload(**overrides),
        headers=_auth(token),
    )
    assert r.status_code == 201, f"Create failed: {r.json()}"
    return r.json()


def _transition_report(
    client: TestClient,
    token: str,
    report_id: str,
    new_status: str,
    label: str | None = None,
) -> dict:
    """Helper: transition report status and return response JSON."""
    payload: dict = {"new_status": new_status}
    if label:
        payload["label"] = label
    r = client.post(
        f"/api/v1/reports/{report_id}/status",
        json=payload,
        headers=_auth(token),
    )
    return r.json() if r.status_code < 500 else {"status_code": r.status_code}


# ─────────────────────────────────────────────────────────────────────────────
# 1. Report Creation
# ─────────────────────────────────────────────────────────────────────────────

from unittest.mock import patch
from app.schemas.ai import AIAnalysisResult

class TestReportCreation:

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_multipart_form_data(self, mock_groq: MagicMock, client: TestClient) -> None:
        """Tests that Kavin's frontend multipart/form-data request is accepted and stored."""
        mock_groq.return_value = None  # graceful fallback
        _, token = _create_user_directly(role="citizen")
        
        data = {
            "image_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
            "latitude": "12.9716",
            "longitude": "77.5946",
            "timestamp": "2023-10-27T10:00:00Z",
            "description": "Garbage dump near park"
        }
        
        r = client.post(
            "/api/v1/reports",
            data=data,
            files={"dummy": ("dummy.txt", b"")}, # Force multipart/form-data
            headers=_auth(token),
        )
        assert r.status_code == 201
        body = r.json()
        assert body["description"] == "Garbage dump near park"
        assert body["latitude"] == 12.9716
        assert body["longitude"] == 77.5946
        assert body["image_url"].startswith("/media/reports/")

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_binary_upload_file(self, mock_groq: MagicMock, client: TestClient) -> None:
        """Tests that uploading an actual binary file under 'image' stores in media."""
        mock_groq.return_value = None
        _, token = _create_user_directly(role="citizen")

        raw_bytes = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
            0x00, 0x60, 0x00, 0x00, 0xFF, 0xD9
        ])
        data = {
            "latitude": "12.9716",
            "longitude": "77.5946",
            "description": "Binary uploaded waste photo",
        }
        files = {
            "image": ("waste.jpg", raw_bytes, "image/jpeg"),
        }
        r = client.post(
            "/api/v1/reports",
            data=data,
            files=files,
            headers=_auth(token),
        )
        assert r.status_code == 201
        body = r.json()
        assert body["description"] == "Binary uploaded waste photo"
        assert body["image_url"].startswith("/media/reports/")

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_large_base64_image(self, mock_groq: MagicMock, client: TestClient) -> None:
        """Tests that a realistic large base64 image string is accepted and stored."""
        mock_groq.return_value = None
        _, token = _create_user_directly(role="citizen")
        
        import base64
        valid_jpeg_header = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60
        ]) + (b"\x00" * 100000) + b"\xFF\xD9"
        large_b64 = "data:image/jpeg;base64," + base64.b64encode(valid_jpeg_header).decode("utf-8")
        payload = _create_report_payload()
        payload["image_url"] = large_b64
        
        r = client.post(
            "/api/v1/reports",
            json=payload,
            headers=_auth(token),
        )
        assert r.status_code == 201
        assert r.json()["image_url"].startswith("/media/reports/")


    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_success(self, mock_groq: MagicMock, client: TestClient) -> None:
        mock_groq.return_value = AIAnalysisResult(
            waste_type="medical",
            volume_level="large",
            confidence=0.95,
            severity_score=75.0,
            estimated_weight_kg=50.0,
            is_hazardous=True,
            is_recyclable=False,
            recommended_action="Dispatch hazmat unit"
        )
        _, token = _create_user_directly(role="citizen")
        r = client.post(
            "/api/v1/reports",
            json=_create_report_payload(),
            headers=_auth(token),
        )
        assert r.status_code == 201
        body = r.json()
        assert body["status"] == "analyzing"
        assert body["priority"] == "high" # large medical is high priority
        assert body["progress"] == 10
        assert body["waste_type"] == "medical"
        assert body["is_hazardous"] is True
        assert body["confidence"] == 0.95
        assert body["severity_score"] == 75.0

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_minimal(self, mock_groq: MagicMock, client: TestClient) -> None:
        """Only description is truly optional — all fields have defaults."""
        mock_groq.return_value = AIAnalysisResult(
            waste_type="household",
            volume_level="small",
            confidence=0.8,
            severity_score=20.0,
            estimated_weight_kg=5.0,
            is_hazardous=False,
            is_recyclable=True,
            recommended_action="Regular pickup"
        )
        _, token = _create_user_directly(role="citizen")
        r = client.post(
            "/api/v1/reports",
            json={},
            headers=_auth(token),
        )
        assert r.status_code == 201
        body = r.json()
        assert body["status"] == "analyzing"
        assert body["description"] is None
        assert body["waste_type"] == "household"
        assert body["confidence"] == 0.8

    @patch("app.services.report.analyze_report_with_groq")
    def test_create_report_groq_failure_graceful_degradation(self, mock_groq: MagicMock, client: TestClient) -> None:
        """If Groq fails, creation succeeds with default/pending values."""
        mock_groq.return_value = None
        
        _, token = _create_user_directly(role="citizen")
        r = client.post(
            "/api/v1/reports",
            json=_create_report_payload(),
            headers=_auth(token),
        )
        assert r.status_code == 201
        body = r.json()
        assert body["status"] == "pending"
        assert body["priority"] == "medium"
        assert body["confidence"] == 0.0
        assert body["waste_type"] == "mixed"

    def test_create_report_invalid_volume_level(self, client: TestClient) -> None:
        _, token = _create_user_directly()
        r = client.post(
            "/api/v1/reports",
            json=_create_report_payload(volume_level="enormous"),
            headers=_auth(token),
        )
        assert r.status_code == 422


    def test_create_report_invalid_latitude(self, client: TestClient) -> None:
        _, token = _create_user_directly()
        r = client.post(
            "/api/v1/reports",
            json=_create_report_payload(latitude=999),
            headers=_auth(token),
        )
        assert r.status_code == 422

    def test_create_report_unauthenticated(self, client: TestClient) -> None:
        r = client.post("/api/v1/reports", json=_create_report_payload())
        assert r.status_code == 401

    def test_create_report_officer_can_create(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        r = client.post(
            "/api/v1/reports",
            json=_create_report_payload(),
            headers=_auth(token),
        )
        assert r.status_code == 201

    def test_create_report_sets_user_id(self, client: TestClient) -> None:
        uid, token = _create_user_directly()
        body = _create_report_via_api(client, token)
        assert body["user_id"] == uid

    def test_create_report_creates_initial_history(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        body = _create_report_via_api(client, token)
        r = client.get(
            f"/api/v1/reports/{body['id']}/history",
            headers=_auth(token),
        )
        assert r.status_code == 200
        history = r.json()
        assert len(history) >= 1
        assert history[0]["status"] == "pending"
        assert history[0]["label"] == "Report submitted"


# ─────────────────────────────────────────────────────────────────────────────
# 2. Report Retrieval
# ─────────────────────────────────────────────────────────────────────────────

class TestReportRetrieval:

    def test_get_own_report_citizen(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, token)
        r = client.get(f"/api/v1/reports/{body['id']}", headers=_auth(token))
        assert r.status_code == 200
        assert r.json()["id"] == body["id"]

    def test_get_others_report_citizen_forbidden(self, client: TestClient) -> None:
        _, token1 = _create_user_directly(role="citizen")
        _, token2 = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, token1)
        r = client.get(f"/api/v1/reports/{body['id']}", headers=_auth(token2))
        assert r.status_code == 403

    def test_get_any_report_officer(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        r = client.get(f"/api/v1/reports/{body['id']}", headers=_auth(officer_tok))
        assert r.status_code == 200

    def test_get_nonexistent_report(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        fake_id = str(uuid.uuid4())
        r = client.get(f"/api/v1/reports/{fake_id}", headers=_auth(token))
        assert r.status_code == 404

    def test_get_report_unauthenticated(self, client: TestClient) -> None:
        r = client.get(f"/api/v1/reports/{uuid.uuid4()}")
        assert r.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# 3. Report Update
# ─────────────────────────────────────────────────────────────────────────────

class TestReportUpdate:

    def test_citizen_update_own_pending_report(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, token)
        r = client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"description": "Updated description"},
            headers=_auth(token),
        )
        assert r.status_code == 200
        assert r.json()["description"] == "Updated description"

    def test_citizen_cannot_update_non_pending(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        # Move to analyzing
        client.post(
            f"/api/v1/reports/{body['id']}/status",
            json={"new_status": "analyzing"},
            headers=_auth(officer_tok),
        )
        r = client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"description": "Should fail"},
            headers=_auth(citizen_tok),
        )
        assert r.status_code == 403

    def test_citizen_cannot_update_others_report(self, client: TestClient) -> None:
        _, tok1 = _create_user_directly(role="citizen")
        _, tok2 = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, tok1)
        r = client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"description": "Nope"},
            headers=_auth(tok2),
        )
        assert r.status_code == 403

    def test_citizen_cannot_change_priority(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, token)
        r = client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"priority": "critical"},
            headers=_auth(token),
        )
        assert r.status_code == 403

    def test_officer_can_update_any_report(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        r = client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"priority": "high", "description": "Officer updated"},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200
        assert r.json()["priority"] == "high"

    def test_update_invalid_priority(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        body = _create_report_via_api(client, token)
        r = client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"priority": "ultra"},
            headers=_auth(token),
        )
        assert r.status_code == 422

    def test_update_nonexistent_report(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        r = client.patch(
            f"/api/v1/reports/{uuid.uuid4()}",
            json={"description": "No such report"},
            headers=_auth(token),
        )
        assert r.status_code == 404


# ─────────────────────────────────────────────────────────────────────────────
# 4. Status Workflow
# ─────────────────────────────────────────────────────────────────────────────

class TestStatusWorkflow:

    def test_full_happy_path(self, client: TestClient) -> None:
        """pending → analyzing → assigned → in_progress → completed → verified"""
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]

        for new_status in ["analyzing", "assigned", "in_progress", "completed", "verified"]:
            r = client.post(
                f"/api/v1/reports/{rid}/status",
                json={"new_status": new_status},
                headers=_auth(officer_tok),
            )
            assert r.status_code == 200, f"Failed {new_status}: {r.json()}"
            assert r.json()["status"] == new_status

        # Check final state
        report = client.get(f"/api/v1/reports/{rid}", headers=_auth(officer_tok))
        assert report.json()["status"] == "verified"
        assert report.json()["progress"] == 100

    def test_invalid_transition_rejected(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        # pending → completed is invalid
        r = client.post(
            f"/api/v1/reports/{body['id']}/status",
            json={"new_status": "completed"},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 400
        assert "invalid transition" in r.json()["detail"].lower()

    def test_terminal_state_no_transitions(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        # Walk to verified
        for s in ["analyzing", "assigned", "in_progress", "completed", "verified"]:
            client.post(
                f"/api/v1/reports/{rid}/status",
                json={"new_status": s},
                headers=_auth(officer_tok),
            )
        # Try to transition from verified
        r = client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "pending"},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 400
        assert "terminal" in r.json()["detail"].lower()

    def test_duplicate_from_any_status(self, client: TestClient) -> None:
        """Any non-terminal status can → duplicate."""
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        r = client.post(
            f"/api/v1/reports/{body['id']}/status",
            json={"new_status": "duplicate"},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200
        assert r.json()["status"] == "duplicate"

    def test_escalated_to_assigned(self, client: TestClient) -> None:
        """escalated → assigned is allowed (re-assignment after review)."""
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        for s in ["analyzing", "assigned", "in_progress", "escalated"]:
            client.post(
                f"/api/v1/reports/{rid}/status",
                json={"new_status": s},
                headers=_auth(officer_tok),
            )
        r = client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "assigned"},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200

    def test_status_history_created_on_transition(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "analyzing", "label": "AI analysis started"},
            headers=_auth(officer_tok),
        )
        r = client.get(f"/api/v1/reports/{rid}/history", headers=_auth(officer_tok))
        history = r.json()
        assert len(history) == 2  # pending + analyzing
        assert history[1]["status"] == "analyzing"
        assert history[1]["label"] == "AI analysis started"

    def test_history_correct_transition_info(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        for s in ["analyzing", "assigned"]:
            client.post(
                f"/api/v1/reports/{rid}/status",
                json={"new_status": s},
                headers=_auth(officer_tok),
            )
        r = client.get(f"/api/v1/reports/{rid}/history", headers=_auth(officer_tok))
        history = r.json()
        assert len(history) == 3
        statuses = [h["status"] for h in history]
        assert statuses == ["pending", "analyzing", "assigned"]

    def test_failed_transition_no_partial_update(self, client: TestClient) -> None:
        """Failed transition must not create a history entry or change status."""
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        # Try invalid: pending → verified
        client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "verified"},
            headers=_auth(officer_tok),
        )
        # Status should still be pending
        report = client.get(f"/api/v1/reports/{rid}", headers=_auth(officer_tok))
        assert report.json()["status"] == "pending"
        # History should only have the initial entry
        hist = client.get(f"/api/v1/reports/{rid}/history", headers=_auth(officer_tok))
        assert len(hist.json()) == 1

    def test_citizen_cannot_change_status(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, token)
        r = client.post(
            f"/api/v1/reports/{body['id']}/status",
            json={"new_status": "analyzing"},
            headers=_auth(token),
        )
        assert r.status_code == 403

    def test_invalid_status_value_rejected(self, client: TestClient) -> None:
        _, officer_tok = _create_user_directly(role="officer")
        _, citizen_tok = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, citizen_tok)
        r = client.post(
            f"/api/v1/reports/{body['id']}/status",
            json={"new_status": "nonexistent_status"},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 422

    def test_verified_sets_verified_at(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        for s in ["analyzing", "assigned", "in_progress", "completed", "verified"]:
            client.post(
                f"/api/v1/reports/{rid}/status",
                json={"new_status": s},
                headers=_auth(officer_tok),
            )
        report = client.get(f"/api/v1/reports/{rid}", headers=_auth(officer_tok))
        assert report.json()["verified_at"] is not None


# ─────────────────────────────────────────────────────────────────────────────
# 5. Assignment
# ─────────────────────────────────────────────────────────────────────────────

class TestAssignment:

    def test_assign_team_and_vehicle(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        # Move to analyzing first (assign requires analyzing or escalated)
        client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "analyzing"},
            headers=_auth(officer_tok),
        )
        team_id = _create_team_directly()
        vehicle_id = _create_vehicle_directly()
        r = client.post(
            f"/api/v1/reports/{rid}/assign",
            json={"assigned_team_id": team_id, "assigned_vehicle_id": vehicle_id},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200
        assert r.json()["status"] == "assigned"
        # Verify assignment persisted
        report = client.get(f"/api/v1/reports/{rid}", headers=_auth(officer_tok))
        assert report.json()["assigned_team_id"] == team_id
        assert report.json()["assigned_vehicle_id"] == vehicle_id

    def test_assign_nonexistent_team(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "analyzing"},
            headers=_auth(officer_tok),
        )
        r = client.post(
            f"/api/v1/reports/{rid}/assign",
            json={"assigned_team_id": str(uuid.uuid4())},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 400
        assert "not found" in r.json()["detail"].lower()

    def test_assign_inactive_team(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "analyzing"},
            headers=_auth(officer_tok),
        )
        inactive_team = _create_team_directly(active=False)
        r = client.post(
            f"/api/v1/reports/{rid}/assign",
            json={"assigned_team_id": inactive_team},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 400
        assert "inactive" in r.json()["detail"].lower()

    def test_assign_requires_at_least_one(self, client: TestClient) -> None:
        _, officer_tok = _create_user_directly(role="officer")
        _, citizen_tok = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, citizen_tok)
        r = client.post(
            f"/api/v1/reports/{body['id']}/assign",
            json={},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 400

    def test_citizen_cannot_assign(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, token)
        team_id = _create_team_directly()
        r = client.post(
            f"/api/v1/reports/{body['id']}/assign",
            json={"assigned_team_id": team_id},
            headers=_auth(token),
        )
        assert r.status_code == 403


# ─────────────────────────────────────────────────────────────────────────────
# 6. Listing / Pagination / Filtering
# ─────────────────────────────────────────────────────────────────────────────

class TestReportListing:

    def test_citizen_sees_only_own_reports(self, client: TestClient) -> None:
        _, tok1 = _create_user_directly(role="citizen")
        _, tok2 = _create_user_directly(role="citizen")
        _create_report_via_api(client, tok1)
        _create_report_via_api(client, tok1)
        _create_report_via_api(client, tok2)
        r = client.get("/api/v1/reports", headers=_auth(tok1))
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 2
        assert len(body["items"]) == 2

    def test_officer_sees_all_reports(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        _create_report_via_api(client, citizen_tok)
        r = client.get("/api/v1/reports", headers=_auth(officer_tok))
        assert r.status_code == 200
        assert r.json()["total"] >= 1

    def test_pagination_metadata(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="citizen")
        for _ in range(3):
            _create_report_via_api(client, token)
        r = client.get(
            "/api/v1/reports?page=1&page_size=2",
            headers=_auth(token),
        )
        body = r.json()
        assert len(body["items"]) == 2
        assert body["page"] == 1
        assert body["page_size"] == 2
        assert body["total"] == 3
        assert body["pages"] == 2

    def test_filter_by_status(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        client.post(
            f"/api/v1/reports/{body['id']}/status",
            json={"new_status": "analyzing"},
            headers=_auth(officer_tok),
        )
        r = client.get(
            "/api/v1/reports?status=analyzing",
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200
        for item in r.json()["items"]:
            assert item["status"] == "analyzing"

    def test_filter_by_priority(self, client: TestClient) -> None:
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, officer_tok)
        client.patch(
            f"/api/v1/reports/{body['id']}",
            json={"priority": "critical"},
            headers=_auth(officer_tok),
        )
        r = client.get(
            "/api/v1/reports?priority=critical",
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200
        for item in r.json()["items"]:
            assert item["priority"] == "critical"

    def test_sort_order(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        _create_report_via_api(client, token)
        _create_report_via_api(client, token)
        r = client.get(
            "/api/v1/reports?sort_by=created_at&sort_order=asc",
            headers=_auth(token),
        )
        items = r.json()["items"]
        if len(items) >= 2:
            assert items[0]["created_at"] <= items[1]["created_at"]

    def test_empty_results(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        r = client.get(
            "/api/v1/reports?status=verified&priority=critical&waste_type=nonexistent_type",
            headers=_auth(token),
        )
        assert r.status_code == 200
        body = r.json()
        assert body["total"] == 0
        assert body["items"] == []

    def test_unauthenticated_listing(self, client: TestClient) -> None:
        r = client.get("/api/v1/reports")
        assert r.status_code == 401

    def test_page_size_clamped(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        r = client.get("/api/v1/reports?page_size=999", headers=_auth(token))
        assert r.status_code == 422  # Query validation rejects > 100


# ─────────────────────────────────────────────────────────────────────────────
# 7. Status History
# ─────────────────────────────────────────────────────────────────────────────

class TestStatusHistory:

    def test_retrieve_history(self, client: TestClient) -> None:
        _, citizen_tok = _create_user_directly(role="citizen")
        _, officer_tok = _create_user_directly(role="officer")
        body = _create_report_via_api(client, citizen_tok)
        rid = body["id"]
        client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": "analyzing"},
            headers=_auth(officer_tok),
        )
        # Citizen can view own history
        r = client.get(f"/api/v1/reports/{rid}/history", headers=_auth(citizen_tok))
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_citizen_cannot_view_others_history(self, client: TestClient) -> None:
        _, tok1 = _create_user_directly(role="citizen")
        _, tok2 = _create_user_directly(role="citizen")
        body = _create_report_via_api(client, tok1)
        r = client.get(
            f"/api/v1/reports/{body['id']}/history",
            headers=_auth(tok2),
        )
        assert r.status_code == 403

    def test_history_nonexistent_report(self, client: TestClient) -> None:
        _, token = _create_user_directly(role="officer")
        r = client.get(
            f"/api/v1/reports/{uuid.uuid4()}/history",
            headers=_auth(token),
        )
        assert r.status_code == 404

    def test_history_unauthenticated(self, client: TestClient) -> None:
        r = client.get(f"/api/v1/reports/{uuid.uuid4()}/history")
        assert r.status_code == 401
