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
