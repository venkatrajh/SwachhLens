"""
Unit and integration tests for SwachhLens 2.0 image storage & evidence architecture (Phase 3).
"""

from __future__ import annotations

import asyncio
import io
import os
import uuid
from pathlib import Path
from typing import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.report import Report
from app.models.user import User
from app.services import storage as storage_service
from app.services.email import BrevoEmailService, get_email_service


# 1x1 valid sample images for magic byte tests
TINY_JPEG = bytes([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
    0x00, 0xBF, 0x00, 0xFF, 0xD9
])

TINY_PNG = bytes([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x60, 0x00, 0x00, 0x00,
    0x02, 0x00, 0x01, 0x48, 0xAF, 0xA4, 0x71, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
])

TINY_WEBP = bytes([
    0x52, 0x49, 0x46, 0x46, 0x1A, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
    0x0E, 0x00, 0x00, 0x00, 0x2F, 0x01, 0x00, 0x9D, 0x01, 0x2A, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00,
    0x34, 0x25
])

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


@pytest.fixture(scope="session", autouse=True)
def create_test_tables() -> None:
    asyncio.run(_create_tables())


@pytest.fixture()
def mock_email() -> MagicMock:
    return MagicMock(spec=BrevoEmailService)


@pytest.fixture(autouse=True)
def override_dependencies(mock_email: MagicMock):
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_email_service] = lambda: mock_email
    yield
    app.dependency_overrides.clear()


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app, raise_server_exceptions=True)


def _unique_email(prefix: str = "storage") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


def _create_user_directly(
    role: str = "citizen",
    is_active: bool = True,
    is_verified: bool = True,
) -> tuple[str, str]:
    email = _unique_email(role)
    password = "SecurePassword123!"
    user_id = uuid.uuid4()

    async def _insert() -> User:
        async with TestSessionLocal() as session:
            user = User(
                id=user_id,
                name=f"Test {role.title()}",
                email=email,
                password_hash=hash_password(password),
                role=role,
                is_active=is_active,
                is_verified=is_verified,
            )
            session.add(user)
            await session.commit()
            return user

    asyncio.run(_insert())
    token = create_access_token(
        subject=str(user_id),
        extra_claims={"role": role, "email": email},
    )
    return str(user_id), token


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


class TestImageValidation:
    """Test suite for server-side image byte validation."""

    def test_validate_valid_jpeg(self):
        mime, ext = storage_service.validate_image_bytes(TINY_JPEG)
        assert mime == "image/jpeg"
        assert ext == "jpg"

    def test_validate_valid_png(self):
        mime, ext = storage_service.validate_image_bytes(TINY_PNG)
        assert mime == "image/png"
        assert ext == "png"

    def test_validate_valid_webp(self):
        mime, ext = storage_service.validate_image_bytes(TINY_WEBP)
        assert mime == "image/webp"
        assert ext == "webp"

    def test_validate_empty_file_rejected(self):
        with pytest.raises(ValueError, match="empty"):
            storage_service.validate_image_bytes(b"")

    def test_validate_oversized_file_rejected(self):
        oversized = TINY_JPEG + (b"0" * (6 * 1024 * 1024))
        with pytest.raises(ValueError, match="exceeds"):
            storage_service.validate_image_bytes(oversized, max_size_mb=5)

    def test_validate_corrupt_or_non_image_rejected(self):
        invalid_bytes = b"Hello, this is not an image file header."
        with pytest.raises(ValueError, match="Unsupported or invalid image format"):
            storage_service.validate_image_bytes(invalid_bytes)

    def test_decode_base64_data_uri(self):
        import base64
        b64_str = base64.b64encode(TINY_JPEG).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{b64_str}"
        raw_bytes, mime = storage_service.decode_base64_image(data_uri)
        assert mime == "image/jpeg"
        assert raw_bytes.startswith(b"\xff\xd8\xff")


class TestStorageOperations:
    """Test suite for local storage file operations and deterministic paths."""

    @pytest.mark.asyncio
    async def test_store_and_delete_evidence_locally(self):
        report_id = uuid.uuid4()
        stored_url = await storage_service.store_evidence(
            TINY_JPEG, report_id, evidence_type="before"
        )
        assert stored_url.startswith(f"/media/reports/{report_id}/before/")
        assert stored_url.endswith(".jpg")

        # Verify file exists on disk
        settings = get_settings()
        clean_rel = stored_url.replace("/media/", "")
        local_path = Path(settings.storage_local_dir) / clean_rel
        assert local_path.is_file()
        assert local_path.read_bytes() == TINY_JPEG

        # Clean up
        deleted = await storage_service.delete_evidence(stored_url)
        assert deleted is True
        assert not local_path.exists()

    def test_is_legacy_data_uri(self):
        assert storage_service.is_legacy_data_uri("data:image/jpeg;base64,abc") is True
        assert storage_service.is_legacy_data_uri("/media/reports/123/before/abc.jpg") is False
        assert storage_service.is_legacy_data_uri("https://example.com/photo.jpg") is False
        assert storage_service.is_legacy_data_uri(None) is False


class TestReportStorageIntegration:
    """Integration tests for report creation and evidence storage via API."""

    def test_create_report_with_binary_upload_stores_in_media(self, client: TestClient):
        _, token = _create_user_directly("citizen")
        file_tuple = ("waste.jpg", io.BytesIO(TINY_JPEG), "image/jpeg")
        data = {
            "latitude": "13.0827",
            "longitude": "80.2707",
            "description": "Test binary image storage report",
        }
        files = {"image": file_tuple}

        response = client.post(
            "/api/v1/reports",
            data=data,
            files=files,
            headers=_auth_headers(token),
        )
        assert response.status_code == 201
        body = response.json()
        assert body["image_url"].startswith("/media/reports/")
        assert body["image_url"].endswith(".jpg")

    def test_create_report_with_base64_stores_in_media(self, client: TestClient):
        _, token = _create_user_directly("citizen")
        import base64
        b64_uri = f"data:image/png;base64,{base64.b64encode(TINY_PNG).decode('utf-8')}"
        payload = {
            "image_url": b64_uri,
            "latitude": 13.0827,
            "longitude": 80.2707,
            "description": "Test base64 auto-storage report",
        }

        response = client.post(
            "/api/v1/reports",
            json=payload,
            headers=_auth_headers(token),
        )
        assert response.status_code == 201
        body = response.json()
        assert body["image_url"].startswith("/media/reports/")
        assert body["image_url"].endswith(".png")

    def test_create_report_invalid_image_rejected_with_400(self, client: TestClient):
        _, token = _create_user_directly("citizen")
        fake_file = ("bad.txt", io.BytesIO(b"Not an image at all"), "image/jpeg")
        data = {"latitude": "13.0827", "longitude": "80.2707"}
        files = {"image": fake_file}

        response = client.post(
            "/api/v1/reports",
            data=data,
            files=files,
            headers=_auth_headers(token),
        )
        assert response.status_code == 400
        assert "Image validation failed" in response.json()["detail"]

    def test_legacy_base64_report_retrieves_cleanly(self, client: TestClient):
        _, token = _create_user_directly("citizen")
        payload = {
            "image_url": "https://example.com/legacy_image.jpg",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "description": "Legacy reference test",
        }
        res = client.post(
            "/api/v1/reports",
            json=payload,
            headers=_auth_headers(token),
        )
        assert res.status_code == 201
        report_id = res.json()["id"]

        get_res = client.get(
            f"/api/v1/reports/{report_id}",
            headers=_auth_headers(token),
        )
        assert get_res.status_code == 200
        assert get_res.json()["image_url"] == "https://example.com/legacy_image.jpg"

    def test_resolve_report_with_base64_stores_after_image(self, client: TestClient):
        citizen_user, citizen_token = _create_user_directly("citizen")
        officer_user, officer_token = _create_user_directly("officer")

        # Create report with unique coordinates so duplicate detector does not link it
        res = client.post(
            "/api/v1/reports",
            json={"latitude": 28.6139, "longitude": 77.2090, "description": "Resolve unique test"},
            headers=_auth_headers(citizen_token),
        )
        assert res.status_code == 201
        report_id = res.json()["id"]
        assert res.json()["status"] in ("pending", "analyzing")

        # Advance to in_progress
        client.post(
            f"/api/v1/reports/{report_id}/status",
            json={"new_status": "analyzing"},
            headers=_auth_headers(officer_token),
        )
        client.post(
            f"/api/v1/reports/{report_id}/status",
            json={"new_status": "assigned"},
            headers=_auth_headers(officer_token),
        )
        client.post(
            f"/api/v1/reports/{report_id}/status",
            json={"new_status": "in_progress"},
            headers=_auth_headers(officer_token),
        )

        import base64
        after_b64 = f"data:image/jpeg;base64,{base64.b64encode(TINY_JPEG).decode('utf-8')}"
        resolve_res = client.post(
            f"/api/v1/reports/{report_id}/resolve",
            json={"after_image_url": after_b64, "resolution_notes": "Cleaned up area"},
            headers=_auth_headers(officer_token),
        )
        assert resolve_res.status_code == 200

        # Check report detail
        detail_res = client.get(
            f"/api/v1/reports/{report_id}",
            headers=_auth_headers(officer_token),
        )
        assert detail_res.status_code == 200
        report_body = detail_res.json()
        assert report_body["status"] == "completed"
        assert report_body["after_image_url"].startswith(f"/media/reports/{report_id}/after/")
        assert report_body["after_image_url"].endswith(".jpg")

    def test_resolve_with_arbitrary_external_url_rejected(self, client: TestClient):
        _, citizen_token = _create_user_directly("citizen")
        _, officer_token = _create_user_directly("officer")

        res = client.post(
            "/api/v1/reports",
            json={"latitude": 28.6139, "longitude": 77.2090, "description": "Resolve rejection test"},
            headers=_auth_headers(citizen_token),
        )
        assert res.status_code == 201
        report_id = res.json()["id"]

        for s in ["analyzing", "assigned", "in_progress"]:
            client.post(
                f"/api/v1/reports/{report_id}/status",
                json={"new_status": s},
                headers=_auth_headers(officer_token),
            )

        # Attempt to resolve with arbitrary external URL
        resolve_res = client.post(
            f"/api/v1/reports/{report_id}/resolve",
            json={
                "after_image_url": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
                "resolution_notes": "Fake external photo",
            },
            headers=_auth_headers(officer_token),
        )
        assert resolve_res.status_code == 400
        assert "External or unmanaged image URLs are not permitted" in resolve_res.json()["detail"]

    def test_is_application_storage_url_unit(self):
        assert storage_service.is_application_storage_url("/media/reports/123/after/img.jpg") is True
        assert storage_service.is_application_storage_url("media/reports/123/after/img.jpg") is True
        assert storage_service.is_application_storage_url("https://images.unsplash.com/photo-123") is False
        assert storage_service.is_application_storage_url("http://evil.com/fake.png") is False
        assert storage_service.is_application_storage_url(None) is False
        assert storage_service.is_application_storage_url("") is False

