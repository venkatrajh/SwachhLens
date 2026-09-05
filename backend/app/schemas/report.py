"""
Pydantic schemas for report management.

These are the ONLY objects ever serialised over the API wire.
Internal fields (AI scores, decision-engine recommendations) are included
in responses but are read-only — citizens never set them directly.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator, model_validator, computed_field


# ── Valid enum values (match DB CHECK constraints) ───────────────────────────

VALID_STATUSES = {
    "pending", "analyzing", "assigned", "in_progress",
    "completed", "verified", "duplicate", "escalated",
}
VALID_PRIORITIES = {"low", "medium", "high", "critical"}
VALID_VOLUME_LEVELS = {"small", "medium", "large", "very_large"}


# ─────────────────────────────────────────────────────────────────────────────
# Create
# ─────────────────────────────────────────────────────────────────────────────

class ReportCreateRequest(BaseModel):
    """Payload for POST /api/v1/reports — citizen submits a waste report."""

    description: str | None = Field(default=None, max_length=5000)

    # Location
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    address_label: str | None = Field(default=None, max_length=512)

    # Media
    image_url: str | None = Field(default=None)
    video_url: str | None = Field(default=None)

    # Classification (optional — AI may fill later)
    waste_type: str | None = Field(default=None, max_length=100)
    volume_level: str | None = None
    is_hazardous: bool = False
    is_recyclable: bool = False

    @field_validator("volume_level")
    @classmethod
    def _validate_volume_level(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_VOLUME_LEVELS:
            raise ValueError(
                f"volume_level must be one of: {', '.join(sorted(VALID_VOLUME_LEVELS))}"
            )
        return v


# ─────────────────────────────────────────────────────────────────────────────
# Update
# ─────────────────────────────────────────────────────────────────────────────

class ReportUpdateRequest(BaseModel):
    """Payload for PATCH /api/v1/reports/{id} — update mutable fields."""

    description: str | None = Field(default=None, max_length=5000)

    # Location
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    address_label: str | None = Field(default=None, max_length=512)

    # Media
    image_url: str | None = Field(default=None, max_length=2048)
    video_url: str | None = Field(default=None, max_length=2048)
    before_image_url: str | None = Field(default=None, max_length=2048)
    after_image_url: str | None = Field(default=None, max_length=2048)

    # Classification
    waste_type: str | None = Field(default=None, max_length=100)
    volume_level: str | None = None
    is_hazardous: bool | None = None
    is_recyclable: bool | None = None

    # Priority (officer+ only — validated at API layer)
    priority: str | None = None

    @field_validator("volume_level")
    @classmethod
    def _validate_volume_level(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_VOLUME_LEVELS:
            raise ValueError(
                f"volume_level must be one of: {', '.join(sorted(VALID_VOLUME_LEVELS))}"
            )
        return v

    @field_validator("priority")
    @classmethod
    def _validate_priority(cls, v: str | None) -> str | None:
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(
                f"priority must be one of: {', '.join(sorted(VALID_PRIORITIES))}"
            )
        return v


# ─────────────────────────────────────────────────────────────────────────────
# Status transition
# ─────────────────────────────────────────────────────────────────────────────

class StatusTransitionRequest(BaseModel):
    """Payload for POST /api/v1/reports/{id}/status."""

    new_status: str
    label: str | None = Field(
        default=None,
        max_length=255,
        description="Human-readable description of the transition",
    )

    @model_validator(mode="before")
    @classmethod
    def _accept_status_alias(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "status" in data and "new_status" not in data:
                data["new_status"] = data["status"]
        return data

    @field_validator("new_status")
    @classmethod
    def _validate_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(
                f"new_status must be one of: {', '.join(sorted(VALID_STATUSES))}"
            )
        return v


# ─────────────────────────────────────────────────────────────────────────────
# Assignment
# ─────────────────────────────────────────────────────────────────────────────

class ReportAssignRequest(BaseModel):
    """Payload for POST /api/v1/reports/{id}/assign."""

    assigned_team_id: uuid.UUID | None = None
    assigned_vehicle_id: uuid.UUID | None = None


# ─────────────────────────────────────────────────────────────────────────────
# Resolution
# ─────────────────────────────────────────────────────────────────────────────

class ReportResolveRequest(BaseModel):
    """Payload for POST /api/v1/reports/{id}/resolve."""

    after_image_url: str = Field(..., max_length=2048)
    resolution_notes: str | None = Field(default=None, max_length=1000)


# ─────────────────────────────────────────────────────────────────────────────
# Responses
# ─────────────────────────────────────────────────────────────────────────────

class ReportResponse(BaseModel):
    """Public report representation — safe to return over the API."""

    id: uuid.UUID
    user_id: uuid.UUID

    # Content
    description: str | None
    image_url: str | None
    video_url: str | None
    before_image_url: str | None
    after_image_url: str | None

    # Location
    latitude: float | None
    longitude: float | None
    address_label: str | None

    # Classification
    waste_type: str | None
    volume_level: str | None
    estimated_weight_kg: float | None
    severity_score: float | None
    priority: str
    confidence: float

    # Flags
    duplicate: bool
    linked_report_id: uuid.UUID | None
    is_hazardous: bool
    is_recyclable: bool

    # Decision engine
    recommended_team: str | None
    recommended_vehicle: str | None
    recommended_action: str | None

    # Assignment
    assigned_team_id: uuid.UUID | None
    assigned_vehicle_id: uuid.UUID | None

    # Workflow
    status: str
    progress: int

    # Timestamps
    reported_at: datetime
    verified_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def display_id(self) -> str:
        year = self.created_at.year if getattr(self, "created_at", None) else 2026
        clean_hex = str(self.id).replace("-", "").upper()[:6]
        return f"SL-{year}-{clean_hex}"

    model_config = {"from_attributes": True}


class ReportListResponse(BaseModel):
    """Paginated report list."""

    items: list[ReportResponse]
    total: int
    page: int
    page_size: int
    pages: int


class StatusHistoryResponse(BaseModel):
    """Single status-history entry."""

    id: uuid.UUID
    report_id: uuid.UUID
    label: str
    status: str
    occurred_at: datetime

    model_config = {"from_attributes": True}
