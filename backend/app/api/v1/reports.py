"""
Reports router — /api/v1/reports/...

Endpoints
---------
POST   /reports                Create a new waste report
GET    /reports                List reports (paginated, filtered)
GET    /reports/{id}           Get a single report
PATCH  /reports/{id}           Update a report
POST   /reports/{id}/status    Change report status
POST   /reports/{id}/assign    Assign team/vehicle
GET    /reports/{id}/history   Get status history
"""

from __future__ import annotations

import logging
import math
import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_active_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.report import (
    ReportAssignRequest,
    ReportCreateRequest,
    ReportListResponse,
    ReportResponse,
    ReportUpdateRequest,
    StatusHistoryResponse,
    StatusTransitionRequest,
)
from app.services import report as report_service
from app.services.ai import analyze_report_with_groq
from app.services.duplicate_detection import find_duplicate_report
from app.services.decision_engine import generate_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])


# ── POST /reports ─────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new waste report",
)
async def create_report(
    payload: ReportCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> ReportResponse:
    """Any authenticated active user can create a waste report."""
    report = await report_service.create_report(db, current_user.id, payload)
    return ReportResponse.model_validate(report)


# ── GET /reports ──────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=ReportListResponse,
    summary="List reports (paginated, filtered)",
)
async def list_reports(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
    # Pagination
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    # Filters
    report_status: str | None = Query(None, alias="status", description="Filter by status"),
    priority: str | None = Query(None, description="Filter by priority"),
    waste_type: str | None = Query(None, description="Filter by waste type"),
    assigned_team_id: uuid.UUID | None = Query(None, description="Filter by team"),
    assigned_vehicle_id: uuid.UUID | None = Query(None, description="Filter by vehicle"),
    user_id: uuid.UUID | None = Query(None, description="Filter by reporter (officer+)"),
    is_duplicate: bool | None = Query(None, description="Filter duplicates"),
    created_after: datetime | None = Query(None, description="Created after (ISO 8601)"),
    created_before: datetime | None = Query(None, description="Created before (ISO 8601)"),
    # Sorting
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
) -> ReportListResponse:
    """
    List reports with pagination, filtering, and sorting.

    - **Citizens** see only their own reports.
    - **Officers/commissioners** see all reports (can filter by user_id).
    """
    # Citizens can only see their own reports
    filter_user_id = user_id
    if current_user.role == "citizen":
        filter_user_id = current_user.id

    reports, total = await report_service.list_reports(
        db,
        user_id=filter_user_id,
        status=report_status,
        priority=priority,
        waste_type=waste_type,
        assigned_team_id=assigned_team_id,
        assigned_vehicle_id=assigned_vehicle_id,
        is_duplicate=is_duplicate,
        created_after=created_after,
        created_before=created_before,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    pages = max(1, math.ceil(total / page_size))
    return ReportListResponse(
        items=[ReportResponse.model_validate(r) for r in reports],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


# ── GET /reports/{id} ─────────────────────────────────────────────────────────

@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get a single report",
)
async def get_report(
    report_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> ReportResponse:
    """
    Retrieve a report by ID.

    - **Citizens** can only view their own reports.
    - **Officers/commissioners** can view any report.
    """
    report = await report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    # Citizens can only view their own reports
    if current_user.role == "citizen" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own reports.",
        )

    return ReportResponse.model_validate(report)


# ── PATCH /reports/{id} ───────────────────────────────────────────────────────

@router.patch(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Update a report",
)
async def update_report(
    report_id: uuid.UUID,
    payload: ReportUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> ReportResponse:
    """
    Update a report.

    - **Citizens** can update their own report only while status is 'pending'.
    - **Officers/commissioners** can update any report at any time.
    """
    report = await report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    if current_user.role == "citizen":
        if report.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own reports.",
            )
        if report.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update reports that are still pending.",
            )
        # Citizens cannot change priority
        if payload.priority is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only officers and commissioners can change report priority.",
            )

    report = await report_service.update_report(db, report, payload)
    return ReportResponse.model_validate(report)


# ── POST /reports/{id}/status ─────────────────────────────────────────────────

@router.post(
    "/{report_id}/status",
    response_model=StatusHistoryResponse,
    summary="Change report status",
)
async def change_status(
    report_id: uuid.UUID,
    payload: StatusTransitionRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> StatusHistoryResponse:
    """
    Execute a status transition on a report.

    Only officers and commissioners can change report status.
    The transition must be valid according to the workflow.
    """
    report = await report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    try:
        history = await report_service.transition_status(
            db, report, payload.new_status, label=payload.label,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return StatusHistoryResponse.model_validate(history)


# ── POST /reports/{id}/assign ─────────────────────────────────────────────────

@router.post(
    "/{report_id}/assign",
    response_model=StatusHistoryResponse,
    summary="Assign team/vehicle to a report",
)
async def assign_report(
    report_id: uuid.UUID,
    payload: ReportAssignRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> StatusHistoryResponse:
    """
    Assign a team and/or vehicle to a report.

    Automatically transitions the report to 'assigned' status.
    The referenced team/vehicle must exist and be active.
    """
    if payload.assigned_team_id is None and payload.assigned_vehicle_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of assigned_team_id or assigned_vehicle_id is required.",
        )

    report = await report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    try:
        history = await report_service.assign_report(
            db, report,
            team_id=payload.assigned_team_id,
            vehicle_id=payload.assigned_vehicle_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return StatusHistoryResponse.model_validate(history)


# ── POST /reports/{id}/analyze ────────────────────────────────────────────────

@router.post(
    "/{report_id}/analyze",
    response_model=ReportResponse,
    summary="Trigger AI analysis and decision engine",
)
async def analyze_report(
    report_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> ReportResponse:
    """
    Triggers the Groq AI analysis workflow on a pending report.

    Workflow:
    1. Transition report to 'analyzing'.
    2. Check for geospatial duplicates.
    3. Run Groq AI to extract features (waste_type, severity, etc.).
    4. Run decision engine for recommendations.
    5. Leaves the report in 'analyzing' for manual officer assignment.
    """

    report = await report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    if report.status != "pending" and report.status != "analyzing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report is in '{report.status}' state and cannot be analyzed.",
        )

    # 1. Transition to analyzing (if not already)
    if report.status == "pending":
        try:
            await report_service.transition_status(
                db, report, "analyzing", label="AI analysis started"
            )
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # 2. Duplicate detection
    duplicate = await find_duplicate_report(db, report)
    if duplicate:
        report.duplicate = True
        report.linked_report_id = duplicate.id
        await report_service.transition_status(
            db, report, "duplicate", label=f"Marked as duplicate of {duplicate.id}"
        )
        # Commit duplicate status and stop
        await db.commit()
        await db.refresh(report)
        return ReportResponse.model_validate(report)

    # 3. AI Analysis
    ai_result = await analyze_report_with_groq(report.description, report.image_url)
    if not ai_result:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI analysis failed or returned invalid output.",
        )

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
    report.recommended_team = recs["recommended_team"]
    report.recommended_vehicle = recs["recommended_vehicle"]
    report.recommended_action = recs["recommended_action"]

    # Keep in 'analyzing' state. Flush and refresh to get generated column values.
    await db.flush()
    await db.refresh(report)
    await db.commit()

    return ReportResponse.model_validate(report)


# ── GET /reports/{id}/history ─────────────────────────────────────────────────

@router.get(
    "/{report_id}/history",
    response_model=list[StatusHistoryResponse],
    summary="Get report status history",
)
async def get_status_history(
    report_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> list[StatusHistoryResponse]:
    """
    Retrieve the full status history for a report.

    - **Citizens** can only view history for their own reports.
    - **Officers/commissioners** can view history for any report.
    """
    report = await report_service.get_report(db, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    if current_user.role == "citizen" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view history for your own reports.",
        )

    history = await report_service.get_status_history(db, report_id)
    return [StatusHistoryResponse.model_validate(h) for h in history]
