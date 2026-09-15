from datetime import datetime
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import require_roles
from app.services import analytics
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    FleetWorkloadResponse,
    PerformanceResponse,
    TrendsResponse,
    HotspotsResponse,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
    summary="Get analytics summary KPIs",
)
async def get_analytics_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
) -> AnalyticsSummaryResponse:
    return await analytics.get_analytics_summary(db, start_date=start_date, end_date=end_date)


@router.get(
    "/fleet",
    response_model=FleetWorkloadResponse,
    summary="Get fleet and team workload overview",
)
async def get_fleet_workload(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> FleetWorkloadResponse:
    return await analytics.get_fleet_workload(db)


@router.get(
    "/performance",
    response_model=PerformanceResponse,
    summary="Get resolution and performance metrics",
)
async def get_performance_metrics(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
) -> PerformanceResponse:
    return await analytics.get_performance_metrics(db, start_date=start_date, end_date=end_date)


@router.get(
    "/trends",
    response_model=TrendsResponse,
    summary="Get temporal reporting and resolution trends",
)
async def get_trends(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    interval: str = Query("day", pattern="^(day|week|month)$", description="Aggregation interval"),
) -> TrendsResponse:
    return await analytics.get_trends(db, start_date=start_date, end_date=end_date, interval=interval)


@router.get(
    "/hotspots",
    response_model=HotspotsResponse,
    summary="Get municipal waste incident geographic density hotspots",
)
async def get_hotspots(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    radius_meters: float = Query(250.0, ge=50.0, le=5000.0, description="Hotspot cluster radius in meters"),
    min_reports: int = Query(2, ge=2, le=50, description="Minimum report count to qualify as a hotspot"),
) -> HotspotsResponse:
    return await analytics.detect_hotspots(
        db,
        start_date=start_date,
        end_date=end_date,
        radius_meters=radius_meters,
        min_reports=min_reports,
    )
