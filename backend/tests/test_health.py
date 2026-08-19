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
