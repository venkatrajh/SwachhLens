"""
Health check router — GET /api/v1/health

Returns a simple liveness signal so load-balancers, CI pipelines,
and the frontend can verify the backend is up.
"""

from __future__ import annotations

import logging
from typing import Annotated
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    """Schema for the health-check response."""

    status: str
    app_name: str
    version: str
    environment: str
    timestamp: str  # ISO-8601 UTC


class ReadinessResponse(BaseModel):
    """Schema for the readiness probe response."""

    status: str
    database: str
    app_name: str
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


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    summary="Readiness check",
    description="Validates database connectivity and service readiness.",
)
async def readiness_check(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ReadinessResponse:
    """Readiness endpoint — verifies database connectivity using SELECT 1."""
    settings = get_settings()
    try:
        result = await db.execute(text("SELECT 1"))
        val = result.scalar()
        if val != 1:
            raise ValueError(f"Unexpected query result: {val}")
    except Exception as exc:
        logger.error("Database readiness check failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
        )

    return ReadinessResponse(
        status="ready",
        database="ok",
        app_name=settings.app_name,
        environment=settings.environment,
        timestamp=datetime.now(tz=timezone.utc).isoformat(),
    )
