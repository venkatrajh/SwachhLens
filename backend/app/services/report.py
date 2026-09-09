"""
Report service — business logic for the core report workflow.

All database operations are async (SQLAlchemy 2.x).
Status transitions are validated and recorded atomically.
"""

from __future__ import annotations

import logging
import math
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.models.report_status_history import ReportStatusHistory
from app.models.team import Team
from app.models.vehicle import Vehicle
from app.schemas.report import ReportCreateRequest, ReportUpdateRequest
from app.services.ai import analyze_report_with_groq
from app.services.duplicate_detection import find_duplicate_report
from app.services.decision_engine import generate_recommendations
from app.services.geocoding import reverse_geocode_coordinates
from app.services.cleanup_images import get_cleanup_image_for_report

logger = logging.getLogger(__name__)


# ── Valid status transitions ─────────────────────────────────────────────────

VALID_TRANSITIONS: dict[str, set[str]] = {
    "pending":     {"analyzing", "duplicate"},
    "analyzing":   {"assigned", "duplicate"},
    "assigned":    {"assigned", "in_progress", "duplicate"},
    "in_progress": {"completed", "escalated", "duplicate"},
    "completed":   {"verified", "duplicate"},
    "escalated":   {"assigned", "duplicate"},
    # Terminal states — no outgoing transitions
    "verified":    set(),
    "duplicate":   set(),
}

# Default progress values for each status
STATUS_PROGRESS: dict[str, int] = {
    "pending": 0,
    "analyzing": 10,
    "assigned": 25,
    "in_progress": 50,
    "completed": 90,
    "verified": 100,
    "escalated": 50,
    "duplicate": 0,
}


def _now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)


# ── Create ───────────────────────────────────────────────────────────────────

async def create_report(
    db: AsyncSession,
    user_id: uuid.UUID,
    payload: ReportCreateRequest,
) -> Report:
    """
    Create a new waste report and record the initial 'pending' status history.

    Both operations happen in the same flush — atomic within the caller's
    transaction boundary.
    """
    address_label = payload.address_label
    if not address_label and payload.latitude is not None and payload.longitude is not None:
        try:
            address_label = await reverse_geocode_coordinates(payload.latitude, payload.longitude)
        except Exception as exc:
            logger.warning("Reverse geocoding failed gracefully: %s", exc)
            address_label = f"{payload.latitude:.5f}°, {payload.longitude:.5f}°"

    report = Report(
        user_id=user_id,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        address_label=address_label,
        image_url=payload.image_url,
        video_url=payload.video_url,
        waste_type=payload.waste_type,
        volume_level=payload.volume_level,
        is_hazardous=payload.is_hazardous,
        is_recyclable=payload.is_recyclable,
        status="pending",
        priority="medium",
        progress=0,
        confidence=0.0,
        duplicate=False,
    )
    db.add(report)
    await db.flush()  # generates report.id

    # Record initial status history
    history = ReportStatusHistory(
        report_id=report.id,
        label="Report submitted",
        status="pending",
    )
    db.add(history)
    await db.flush()
    await db.refresh(report)

    logger.info("Report created: id=%s user=%s", report.id, user_id)
    return report


# ── Retrieve ─────────────────────────────────────────────────────────────────

async def get_report(db: AsyncSession, report_id: uuid.UUID) -> Report | None:
    """Fetch a single report by ID."""
    return await db.scalar(select(Report).where(Report.id == report_id))


# ── List (paginated, filtered, sorted) ───────────────────────────────────────

async def list_reports(
    db: AsyncSession,
    *,
    # Filters
    user_id: uuid.UUID | None = None,
    status: str | None = None,
    priority: str | None = None,
    waste_type: str | None = None,
    assigned_team_id: uuid.UUID | None = None,
    assigned_vehicle_id: uuid.UUID | None = None,
    is_duplicate: bool | None = None,
    created_after: datetime | None = None,
    created_before: datetime | None = None,
    # Pagination
    page: int = 1,
    page_size: int = 20,
    # Sorting
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[Report], int]:
    """
    Return (reports, total_count) with filtering, pagination, and sorting.

    Parameters
    ----------
    page : int
        1-indexed page number.
    page_size : int
        Items per page (clamped to 1–100).

    Returns
    -------
    tuple[list[Report], int]
        (page_items, total_matching_count)
    """
    # Clamp pagination
    page = max(1, page)
    page_size = max(1, min(100, page_size))

    # Build base query
    query = select(Report)
    count_query = select(func.count()).select_from(Report)

    # Apply filters
    conditions = []
    if user_id is not None:
        conditions.append(Report.user_id == user_id)
    if status is not None:
        conditions.append(Report.status == status)
    if priority is not None:
        conditions.append(Report.priority == priority)
    if waste_type is not None:
        conditions.append(Report.waste_type == waste_type)
    if assigned_team_id is not None:
        conditions.append(Report.assigned_team_id == assigned_team_id)
    if assigned_vehicle_id is not None:
        conditions.append(Report.assigned_vehicle_id == assigned_vehicle_id)
    if is_duplicate is not None:
        conditions.append(Report.duplicate == is_duplicate)
    if created_after is not None:
        conditions.append(Report.created_at >= created_after)
    if created_before is not None:
        conditions.append(Report.created_at <= created_before)

    if conditions:
        query = query.where(*conditions)
        count_query = count_query.where(*conditions)

    # Sort
    ALLOWED_SORT_FIELDS = {
        "created_at": Report.created_at,
        "updated_at": Report.updated_at,
        "reported_at": Report.reported_at,
        "priority": Report.priority,
        "status": Report.status,
        "severity_score": Report.severity_score,
    }
    sort_col = ALLOWED_SORT_FIELDS.get(sort_by, Report.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Count
    total = await db.scalar(count_query) or 0

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    reports = list(result.scalars().all())

    return reports, total


# ── Update ───────────────────────────────────────────────────────────────────

async def update_report(
    db: AsyncSession,
    report: Report,
    payload: ReportUpdateRequest,
) -> Report:
    """
    Apply partial update to a report.

    Only non-None fields in the payload are updated.
    """
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(report, field, value)

    await db.flush()
    await db.refresh(report)
    logger.info("Report updated: id=%s fields=%s", report.id, list(update_data.keys()))
    return report


# ── Status transition ────────────────────────────────────────────────────────

async def transition_status(
    db: AsyncSession,
    report: Report,
    new_status: str,
    label: str | None = None,
) -> ReportStatusHistory:
    """
    Validate and execute a status transition.

    Both the report update and the history entry are flushed in the same
    operation — atomic within the caller's transaction boundary.

    Raises
    ------
    ValueError
        If the transition is not allowed.
    """
    current = report.status
    allowed = VALID_TRANSITIONS.get(current, set())

    if new_status not in allowed:
        if not allowed:
            raise ValueError(
                f"Report is in terminal status '{current}' — no transitions allowed."
            )
        raise ValueError(
            f"Invalid transition: '{current}' -> '{new_status}'. "
            f"Allowed: {', '.join(sorted(allowed))}."
        )

    # Build default label if not provided
    if label is None:
        label = f"Status changed from {current} to {new_status}"

    # Update report
    report.status = new_status
    report.progress = STATUS_PROGRESS.get(new_status, report.progress)

    if new_status in ("completed", "verified") and not report.after_image_url:
        report.after_image_url = get_cleanup_image_for_report(report.waste_type, str(report.id))

    if new_status == "verified":
        report.verified_at = _now_utc()

    # Create history entry
    history = ReportStatusHistory(
        report_id=report.id,
        label=label,
        status=new_status,
    )
    db.add(history)
    await db.flush()
    await db.refresh(history)

    logger.info(
        "Report %s: %s -> %s (label=%r)",
        report.id, current, new_status, label,
    )
    return history


# ── Assignment ───────────────────────────────────────────────────────────────

async def assign_report(
    db: AsyncSession,
    report: Report,
    team_id: uuid.UUID | None = None,
    vehicle_id: uuid.UUID | None = None,
) -> ReportStatusHistory:
    """
    Assign a team/vehicle to a report and transition to 'assigned'.

    Validates that referenced team/vehicle exist and are active.

    Raises
    ------
    ValueError
        If team/vehicle not found, inactive, or transition invalid.
    """
    if team_id is not None:
        team = await db.scalar(select(Team).where(Team.id == team_id))
        if team is None:
            raise ValueError(f"Team {team_id} not found.")
        if not team.active:
            raise ValueError(f"Team '{team.name}' is inactive.")
        report.assigned_team_id = team_id

    if vehicle_id is not None:
        vehicle = await db.scalar(select(Vehicle).where(Vehicle.id == vehicle_id))
        if vehicle is None:
            raise ValueError(f"Vehicle {vehicle_id} not found.")
        if not vehicle.active:
            raise ValueError(f"Vehicle '{vehicle.plate_number}' is inactive.")
        report.assigned_vehicle_id = vehicle_id

    # Transition to assigned (validates current status)
    label = "Report assigned"
    parts = []
    if team_id is not None:
        parts.append(f"team={team_id}")
    if vehicle_id is not None:
        parts.append(f"vehicle={vehicle_id}")
    if parts:
        label = f"Report assigned ({', '.join(parts)})"

    return await transition_status(db, report, "assigned", label=label)


# ─────────────────────────────────────────────────────────────────────────────
# Resolution
# ─────────────────────────────────────────────────────────────────────────────

async def resolve_report(
    db: AsyncSession,
    report: Report,
    after_image_url: str,
    resolution_notes: str | None = None,
) -> ReportStatusHistory:
    """
    Resolve a report and transition to 'completed'.
    """
    report.after_image_url = after_image_url
    
    label = "Report resolved"
    if resolution_notes:
        label = f"Report resolved: {resolution_notes}"
        
    return await transition_status(db, report, "completed", label=label)


# ── Status history ───────────────────────────────────────────────────────────

async def get_status_history(
    db: AsyncSession,
    report_id: uuid.UUID,
) -> list[ReportStatusHistory]:
    """Return the ordered status history for a report."""
    result = await db.execute(
        select(ReportStatusHistory)
        .where(ReportStatusHistory.report_id == report_id)
        .order_by(ReportStatusHistory.occurred_at.asc())
    )
    return list(result.scalars().all())


# ── AI Analysis Pipeline ─────────────────────────────────────────────────────

async def run_analysis_pipeline(
    db: AsyncSession,
    report: Report,
) -> bool:
    """
    Run duplicate detection, Groq AI analysis, and decision engine synchronously.
    Does NOT commit the transaction; caller must commit.
    
    Returns True if analysis succeeded (or it was a duplicate).
    Returns False if AI analysis failed.
    """
    # 1. Initial Duplicate detection (proximity & time window, with reporter-provided waste_type)
    duplicate = await find_duplicate_report(db, report)
    if duplicate:
        report.duplicate = True
        report.linked_report_id = duplicate.id
        if report.status == "pending":
            await transition_status(db, report, "analyzing", label="AI analysis started")
        await transition_status(
            db, report, "duplicate", label=f"Marked as duplicate of {duplicate.id}"
        )
        await db.flush()
        await db.refresh(report)
        return True

    # 2. AI Analysis
    ai_result = await analyze_report_with_groq(report.description, report.image_url)
    if not ai_result:
        return False

    # 3. Transition to analyzing if currently pending
    if report.status == "pending":
        await transition_status(db, report, "analyzing", label="AI analysis completed")

    # 4. Update AI fields
    report.waste_type = ai_result.waste_type
    report.volume_level = ai_result.volume_level
    report.confidence = ai_result.confidence
    report.severity_score = ai_result.severity_score
    report.estimated_weight_kg = ai_result.estimated_weight_kg
    report.is_hazardous = ai_result.is_hazardous
    report.is_recyclable = ai_result.is_recyclable

    # 5. Decision Engine
    recs = generate_recommendations(ai_result)
    report.recommended_team = recs.get("recommended_team")
    report.recommended_vehicle = recs.get("recommended_vehicle")
    report.recommended_action = recs.get("recommended_action")
    if "priority" in recs:
        report.priority = recs["priority"]

    # 6. Secondary duplicate check (proximity, time window, and AI-classified waste_type)
    duplicate_after_ai = await find_duplicate_report(db, report)
    if duplicate_after_ai:
        report.duplicate = True
        report.linked_report_id = duplicate_after_ai.id
        await transition_status(
            db, report, "duplicate", label=f"Marked as duplicate of {duplicate_after_ai.id}"
        )

    await db.flush()
    await db.refresh(report)
    return True

