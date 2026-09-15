"""
Tests for GET /api/v1/health

Covers:
- HTTP 200 response
- Response body schema (status, app_name, version, environment, timestamp)
- ISO-8601 UTC timestamp format
- Content-Type is application/json
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_200() -> None:
    """Health endpoint must return HTTP 200."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_content_type_json() -> None:
    """Response Content-Type must be application/json."""
    response = client.get("/api/v1/health")
    assert "application/json" in response.headers["content-type"]


def test_health_response_schema() -> None:
    """All required fields must be present in the response body."""
    response = client.get("/api/v1/health")
    body = response.json()

    assert "status" in body
    assert "app_name" in body
    assert "version" in body
    assert "environment" in body
    assert "timestamp" in body


def test_health_status_is_ok() -> None:
    """status field must equal 'ok'."""
    response = client.get("/api/v1/health")
    assert response.json()["status"] == "ok"


def test_health_app_name_is_string() -> None:
    """app_name must be a non-empty string."""
    body = client.get("/api/v1/health").json()
    assert isinstance(body["app_name"], str)
    assert len(body["app_name"]) > 0


def test_health_version_is_string() -> None:
    """version must be a non-empty string."""
    body = client.get("/api/v1/health").json()
    assert isinstance(body["version"], str)
    assert len(body["version"]) > 0


def test_health_environment_is_valid() -> None:
    """environment must be one of the accepted literals."""
    valid_envs = {"development", "staging", "production"}
    body = client.get("/api/v1/health").json()
    assert body["environment"] in valid_envs


def test_health_timestamp_is_iso8601_utc() -> None:
    """timestamp must be parseable as an ISO-8601 UTC datetime."""
    body = client.get("/api/v1/health").json()
    ts = body["timestamp"]
    # datetime.fromisoformat raises ValueError on bad format
    parsed = datetime.fromisoformat(ts)
    # Must be timezone-aware
    assert parsed.tzinfo is not None


def test_health_unknown_path_returns_404() -> None:
    """Requests to unknown paths must return 404, not 200."""
    response = client.get("/api/v1/unknown-endpoint")
    assert response.status_code == 404


def test_health_ready_success() -> None:
    """Readiness endpoint must return 200 when database connectivity succeeds."""
    from app.db.session import get_db

    class MockScalarResult:
        def scalar(self):
            return 1

    class WorkingSession:
        async def execute(self, *args, **kwargs):
            return MockScalarResult()

    async def mock_working_get_db():
        yield WorkingSession()

    app.dependency_overrides[get_db] = mock_working_get_db
    try:
        response = client.get("/api/v1/health/ready")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "ready"
        assert body["database"] == "ok"
        assert "timestamp" in body
        assert "environment" in body
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_health_ready_db_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    """Readiness endpoint must return 503 when database connectivity fails."""
    from app.db.session import get_db

    class FailingSession:
        async def execute(self, *args, **kwargs):
            raise RuntimeError("Database connection timed out")

    async def mock_failing_get_db():
        yield FailingSession()

    app.dependency_overrides[get_db] = mock_failing_get_db
    try:
        response = client.get("/api/v1/health/ready")
        assert response.status_code == 503
        assert response.json()["detail"] == "Database service unavailable"
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_security_headers_present() -> None:
    """Responses must include required production security headers (Phase 10: F-SEC-04)."""
    response = client.get("/api/v1/health")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_gzip_compression_on_large_response() -> None:
    """Responses larger than 1000 bytes must be gzip compressed when client accepts gzip (Phase 10: F-PERF-01)."""
    # /openapi.json in dev mode is > 1000 bytes
    response = client.get("/openapi.json", headers={"Accept-Encoding": "gzip"})
    if response.status_code == 200:
        assert response.headers.get("Content-Encoding") == "gzip"


def test_production_docs_disabled(monkeypatch: pytest.MonkeyPatch) -> None:
    """API docs must be disabled when environment is production (Phase 10: F-SEC-01)."""
    from app.core.config import get_settings
    from app.main import create_app

    settings = get_settings()
    monkeypatch.setattr(settings, "environment", "production")
    monkeypatch.setattr(settings, "jwt_secret_key", "secure-production-jwt-random-secret-key-123456789")

    prod_app = create_app()
    prod_client = TestClient(prod_app)

    docs_res = prod_client.get("/docs")
    assert docs_res.status_code == 404

    redoc_res = prod_client.get("/redoc")
    assert redoc_res.status_code == 404

    openapi_res = prod_client.get("/openapi.json")
    assert openapi_res.status_code == 404


def test_global_exception_handler_sanitization(monkeypatch: pytest.MonkeyPatch) -> None:
    """Unhandled 500 exceptions must expose details in dev and return generic message in production."""
    from app.core.config import get_settings
    from app.main import create_app

    settings = get_settings()

    # Dev mode: detail should be exposed
    monkeypatch.setattr(settings, "environment", "development")
    dev_app = create_app()

    @dev_app.get("/test-error")
    def fail_endpoint():
        raise ValueError("Secret database failure message")

    dev_client = TestClient(dev_app, raise_server_exceptions=False)
    res = dev_client.get("/test-error")
    assert res.status_code == 500
    assert res.json()["detail"] == "Secret database failure message"

    # Production mode: detail must be sanitized to generic string
    monkeypatch.setattr(settings, "environment", "production")
    monkeypatch.setattr(settings, "jwt_secret_key", "secure-production-jwt-random-secret-key-123456789")
    prod_app = create_app()

    @prod_app.get("/test-error")
    def fail_endpoint_prod():
        raise ValueError("Secret database failure message")

    prod_client = TestClient(prod_app, raise_server_exceptions=False)
    res_prod = prod_client.get("/test-error")
    assert res_prod.status_code == 500
    assert res_prod.json()["detail"] == "Internal server error"

