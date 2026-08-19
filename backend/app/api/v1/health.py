"""
Health check router — GET /api/v1/health

Returns a simple liveness signal so load-balancers, CI pipelines,
and the frontend can verify the backend is up.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    """Schema for the health-check response."""

    status: str
    app_name: str
    version: str
    environment: str
    timestamp: str  # ISO-8601 UTC


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness check",
    description="Returns 200 OK with basic app metadata when the service is running.",
)
async def health_check() -> HealthResponse:
    """Liveness endpoint — no database or external dependency required."""
    settings = get_settings()
    logger.debug("Health check requested")
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        timestamp=datetime.now(tz=timezone.utc).isoformat(),
    )
