import uuid
import asyncio
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.models.notification import Notification
from app.models.report import Report
from tests.test_reports import (
    client,
    override_dependencies,
    mock_email,
    create_test_tables,
    _auth,
    _create_user_directly,
    _create_report_via_api,
    TestSessionLocal
)

def seed_notification(user_id: str | uuid.UUID, report_id: str | uuid.UUID = None) -> uuid.UUID:
    async def _seed():
        async with TestSessionLocal() as db:
            notif = Notification(
                user_id=uuid.UUID(str(user_id)),
                report_id=uuid.UUID(str(report_id)) if report_id else None,
                event_type="test_event",
                title="Test Title",
                message="Test Message",
                is_read=False,
            )
            db.add(notif)
            await db.commit()
            await db.refresh(notif)
            return notif.id
    return asyncio.run(_seed())

def test_get_notifications_empty(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    response = client.get("/api/v1/notifications", headers=_auth(citizen_token))
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []

def test_get_notifications_with_items(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    notif_id = seed_notification(citizen_id)

    response = client.get("/api/v1/notifications", headers=_auth(citizen_token))
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == str(notif_id)
    assert data["items"][0]["is_read"] is False

def test_get_unread_count(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    notif_id = seed_notification(citizen_id)

    response = client.get("/api/v1/notifications/unread-count", headers=_auth(citizen_token))
    assert response.status_code == 200
    assert response.json()["unread_count"] == 1

def test_mark_notification_read(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    notif_id = seed_notification(citizen_id)

    response = client.patch(f"/api/v1/notifications/{notif_id}/read", headers=_auth(citizen_token))
    assert response.status_code == 200
    assert response.json()["is_read"] is True

    # Verify unread count is now 0
    count_response = client.get("/api/v1/notifications/unread-count", headers=_auth(citizen_token))
    assert count_response.json()["unread_count"] == 0

def test_mark_all_read(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    
    async def _seed_multi():
        async with TestSessionLocal() as db:
            uid = uuid.UUID(str(citizen_id))
            n1 = Notification(user_id=uid, event_type="test1", title="T1", message="M1", is_read=False)
            n2 = Notification(user_id=uid, event_type="test2", title="T2", message="M2", is_read=False)
            db.add_all([n1, n2])
            await db.commit()
    asyncio.run(_seed_multi())

    response = client.post("/api/v1/notifications/mark-all-read", headers=_auth(citizen_token))
    assert response.status_code == 200
    assert response.json()["updated_count"] == 2

    # Verify unread count is 0
    count_response = client.get("/api/v1/notifications/unread-count", headers=_auth(citizen_token))
    assert count_response.json()["unread_count"] == 0

def test_mark_read_not_found_or_forbidden(client: TestClient) -> None:
    citizen_id, citizen_token = _create_user_directly(role="citizen")
    notif_id = seed_notification(citizen_id)
    
    officer_id, officer_token = _create_user_directly(role="officer")

    # Officer tries to mark citizen's notification as read
    response = client.patch(
        f"/api/v1/notifications/{notif_id}/read",
        headers=_auth(officer_token)
    )
    assert response.status_code == 404


def test_resolve_creates_municipal_verification_notification(client: TestClient) -> None:
    """When a report is resolved with genuine evidence, municipal officers receive a verification_required notification."""
    citizen_id, citizen_tok = _create_user_directly(role="citizen", name="Citizen Reporter")
    officer_id, officer_tok = _create_user_directly(role="officer", name="Municipal Officer")
    commissioner_id, comm_tok = _create_user_directly(role="commissioner", name="Commissioner")

    # 1. Citizen creates report
    body = _create_report_via_api(client, citizen_tok)
    rid = body["id"]

    # 2. Advance to in_progress
    for s in ["analyzing", "assigned", "in_progress"]:
        r = client.post(
            f"/api/v1/reports/{rid}/status",
            json={"new_status": s},
            headers=_auth(officer_tok),
        )
        assert r.status_code == 200

    # 3. Resolve report with genuine image evidence
    valid_b64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//g=="
    resolve_res = client.post(
        f"/api/v1/reports/{rid}/resolve",
        json={
            "after_image_url": valid_b64,
            "resolution_notes": "Site thoroughly cleared by response team.",
        },
        headers=_auth(officer_tok),
    )
    assert resolve_res.status_code == 200

    # 4. Check Citizen Notification (report_resolved)
    cit_notifs = client.get("/api/v1/notifications", headers=_auth(citizen_tok)).json()["items"]
    cit_resolved_notifs = [n for n in cit_notifs if n["event_type"] == "report_resolved"]
    assert len(cit_resolved_notifs) >= 1
    assert cit_resolved_notifs[0]["report_id"] == rid
    assert "resolved" in cit_resolved_notifs[0]["title"].lower()

    # 5. Check Officer Notification (verification_required)
    off_notifs = client.get("/api/v1/notifications", headers=_auth(officer_tok)).json()["items"]
    off_verif_notifs = [n for n in off_notifs if n["event_type"] == "verification_required"]
    assert len(off_verif_notifs) == 1
    assert off_verif_notifs[0]["report_id"] == rid
    assert off_verif_notifs[0]["title"] == "Cleanup Verification Required"
    assert "verification required" in off_verif_notifs[0]["message"].lower()

    # 6. Check Commissioner Notification (verification_required)
    comm_notifs = client.get("/api/v1/notifications", headers=_auth(comm_tok)).json()["items"]
    comm_verif_notifs = [n for n in comm_notifs if n["event_type"] == "verification_required"]
    assert len(comm_verif_notifs) == 1
    assert comm_verif_notifs[0]["report_id"] == rid

