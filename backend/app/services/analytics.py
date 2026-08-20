from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, literal_column

from app.models.report import Report
from app.models.team import Team
from app.models.vehicle import Vehicle
from app.models.report_status_history import ReportStatusHistory
from app.schemas.analytics import (
    AnalyticsSummaryResponse,
    FleetWorkloadResponse,
    WorkloadItem,
    PerformanceResponse,
    TrendItem,
    TrendsResponse
)

async def get_analytics_summary(
    db: AsyncSession, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None
) -> AnalyticsSummaryResponse:
    query = select(Report)
    
    if start_date:
        query = query.where(Report.reported_at >= start_date)
    if end_date:
        query = query.where(Report.reported_at <= end_date)
    
    reports = (await db.scalars(query)).all()
    
    total = len(reports)
    status_counts = {}
    priority_counts = {}
    waste_type_counts = {}
    hazardous_count = 0
    recyclable_count = 0
    duplicate_count = 0
    
    for r in reports:
        status_counts[r.status] = status_counts.get(r.status, 0) + 1
        priority_counts[r.priority] = priority_counts.get(r.priority, 0) + 1
        
        wt = r.waste_type or "unknown"
        waste_type_counts[wt] = waste_type_counts.get(wt, 0) + 1
        
        if r.is_hazardous:
            hazardous_count += 1
        if r.is_recyclable:
            recyclable_count += 1
        if r.duplicate:
            duplicate_count += 1
            
    return AnalyticsSummaryResponse(
        total_reports=total,
        status_counts=status_counts,
        priority_counts=priority_counts,
        waste_type_counts=waste_type_counts,
        hazardous_count=hazardous_count,
        recyclable_count=recyclable_count,
        duplicate_count=duplicate_count
    )

async def get_fleet_workload(db: AsyncSession) -> FleetWorkloadResponse:
    # 1. Total and active teams
    total_teams = await db.scalar(select(func.count(Team.id))) or 0
    active_teams = await db.scalar(select(func.count(Team.id)).where(Team.active == True)) or 0
    
    # 2. Total and active vehicles
    total_vehicles = await db.scalar(select(func.count(Vehicle.id))) or 0
    active_vehicles = await db.scalar(select(func.count(Vehicle.id)).where(Vehicle.active == True)) or 0
    
    # Active workload statuses: assigned, in_progress
    active_statuses = ["assigned", "in_progress"]
    
    # 3. Team workload
    team_query = (
        select(Team.id, Team.name, func.count(Report.id).label("count"))
        .outerjoin(Report, and_(Report.assigned_team_id == Team.id, Report.status.in_(active_statuses)))
        .group_by(Team.id, Team.name)
    )
    team_rows = (await db.execute(team_query)).all()
    team_workload = [
        WorkloadItem(id=str(row.id), name_or_plate=row.name, active_reports_count=row.count)
        for row in team_rows
    ]
    
    # 4. Vehicle workload
    vehicle_query = (
        select(Vehicle.id, Vehicle.plate_number, func.count(Report.id).label("count"))
        .outerjoin(Report, and_(Report.assigned_vehicle_id == Vehicle.id, Report.status.in_(active_statuses)))
        .group_by(Vehicle.id, Vehicle.plate_number)
    )
    vehicle_rows = (await db.execute(vehicle_query)).all()
    vehicle_workload = [
        WorkloadItem(id=str(row.id), name_or_plate=row.plate_number, active_reports_count=row.count)
        for row in vehicle_rows
    ]
    
    return FleetWorkloadResponse(
        total_teams=total_teams,
        active_teams=active_teams,
        total_vehicles=total_vehicles,
        active_vehicles=active_vehicles,
        team_workload=team_workload,
        vehicle_workload=vehicle_workload
    )

async def get_performance_metrics(
    db: AsyncSession, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None
) -> PerformanceResponse:
    
    base_query = select(Report)
    if start_date:
        base_query = base_query.where(Report.reported_at >= start_date)
    if end_date:
        base_query = base_query.where(Report.reported_at <= end_date)
        
    reports = (await db.scalars(base_query)).all()
    
    completed_count = sum(1 for r in reports if r.status == "completed")
    verified_count = sum(1 for r in reports if r.status == "verified")
    pending_res_count = sum(1 for r in reports if r.status in ["pending", "analyzing", "assigned", "in_progress", "escalated"])

    # Calculate average resolution time (database dialect aware approach, or via python using history table if feasible)
    # The instructions require DB-level if possible, but given the structure, 
    # we can use a dialect-aware query to find the average time difference
    
    # Dialect aware average resolution duration
    dialect = db.bind.dialect.name
    
    # Subquery to find earliest 'completed' timestamp per report
    completed_subq = (
        select(
            ReportStatusHistory.report_id,
            func.min(ReportStatusHistory.occurred_at).label("completed_at")
        )
        .where(ReportStatusHistory.status == "completed")
        .group_by(ReportStatusHistory.report_id)
        .subquery()
    )
    
    # Subquery to find earliest 'verified' timestamp per report
    verified_subq = (
        select(
            ReportStatusHistory.report_id,
            func.min(ReportStatusHistory.occurred_at).label("verified_at")
        )
        .where(ReportStatusHistory.status == "verified")
        .group_by(ReportStatusHistory.report_id)
        .subquery()
    )

    avg_res_query = select(Report.reported_at, completed_subq.c.completed_at).join(completed_subq, Report.id == completed_subq.c.report_id)
    if start_date:
        avg_res_query = avg_res_query.where(Report.reported_at >= start_date)
    if end_date:
        avg_res_query = avg_res_query.where(Report.reported_at <= end_date)

    res_rows = (await db.execute(avg_res_query)).all()
    
    res_durations = []
    for reported_at, completed_at in res_rows:
        if reported_at and completed_at:
            res_durations.append((completed_at - reported_at).total_seconds())
            
    avg_resolution_seconds = sum(res_durations) / len(res_durations) if res_durations else None
    
    # Average Verification Duration (from completed to verified)
    avg_ver_query = (
        select(completed_subq.c.completed_at, verified_subq.c.verified_at)
        .join(verified_subq, completed_subq.c.report_id == verified_subq.c.report_id)
        .join(Report, Report.id == completed_subq.c.report_id)
    )
    if start_date:
        avg_ver_query = avg_ver_query.where(Report.reported_at >= start_date)
    if end_date:
        avg_ver_query = avg_ver_query.where(Report.reported_at <= end_date)
        
    ver_rows = (await db.execute(avg_ver_query)).all()
    
    ver_durations = []
    for completed_at, verified_at in ver_rows:
        if completed_at and verified_at:
            ver_durations.append((verified_at - completed_at).total_seconds())
            
    avg_verification_seconds = sum(ver_durations) / len(ver_durations) if ver_durations else None

    return PerformanceResponse(
        completed_report_count=completed_count,
        verified_report_count=verified_count,
        pending_resolution_count=pending_res_count,
        average_resolution_duration_seconds=avg_resolution_seconds,
        average_verification_duration_seconds=avg_verification_seconds
    )


async def get_trends(
    db: AsyncSession, start_date: Optional[datetime], end_date: Optional[datetime], interval: str
) -> TrendsResponse:
    
    dialect = db.bind.dialect.name
    
    # Define dialect-aware date truncation
    def get_date_trunc(col):
        if dialect == "postgresql":
            return func.date_trunc(interval, col)
        elif dialect == "sqlite":
            if interval == "day":
                return func.strftime("%Y-%m-%d", col)
            elif interval == "month":
                return func.strftime("%Y-%m", col)
            elif interval == "week":
                # SQLite week truncation is tricky; approximate with week number
                return func.strftime("%Y-%W", col)
            else:
                return func.strftime("%Y-%m-%d", col)
        else:
            return func.date(col)

    report_date_expr = get_date_trunc(Report.reported_at).label("date_label")
    
    # Submitted counts
    sub_query = select(report_date_expr, func.count(Report.id)).group_by(report_date_expr)
    if start_date:
        sub_query = sub_query.where(Report.reported_at >= start_date)
    if end_date:
        sub_query = sub_query.where(Report.reported_at <= end_date)
        
    sub_rows = (await db.execute(sub_query)).all()
    submitted_map = {str(row[0]): row[1] for row in sub_rows if row[0]}
    
    # Completed counts (based on status history 'completed')
    comp_date_expr = get_date_trunc(ReportStatusHistory.occurred_at).label("date_label")
    comp_query = (
        select(comp_date_expr, func.count(ReportStatusHistory.report_id))
        .where(ReportStatusHistory.status == "completed")
        .group_by(comp_date_expr)
    )
    if start_date:
        comp_query = comp_query.where(ReportStatusHistory.occurred_at >= start_date)
    if end_date:
        comp_query = comp_query.where(ReportStatusHistory.occurred_at <= end_date)
        
    comp_rows = (await db.execute(comp_query)).all()
    completed_map = {str(row[0]): row[1] for row in comp_rows if row[0]}
    
    # Merge keys and sort
    all_dates = sorted(list(set(submitted_map.keys()) | set(completed_map.keys())))
    
    trends = []
    for d in all_dates:
        trends.append(
            TrendItem(
                date_label=d,
                submitted_count=submitted_map.get(d, 0),
                completed_count=completed_map.get(d, 0)
            )
        )
        
    return TrendsResponse(
        interval=interval,
        trends=trends
    )
