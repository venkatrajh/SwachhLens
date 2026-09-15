import math
from collections import Counter
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
    TrendsResponse,
    HotspotItem,
    HotspotsResponse
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


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate great-circle distance between two geographic coordinates in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


async def detect_hotspots(
    db: AsyncSession,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    radius_meters: float = 250.0,
    min_reports: int = 2,
) -> HotspotsResponse:
    """
    Deterministic operational density clustering for municipal waste incident hotspots.

    Algorithm:
    - Filters valid, non-duplicate reports with real coordinates (latitude != 0, longitude != 0).
    - Uses greedy seed-neighborhood clustering with Haversine distance metric (radius_meters = 250m).
    - Calculates cluster center as arithmetic mean of member coordinates.
    - Determines dominant waste type, max severity, and highest priority level per cluster.
    - Sorts clusters primary by report_count DESC, secondary by max_severity DESC.
    """
    query = select(Report).where(
        Report.latitude.isnot(None),
        Report.longitude.isnot(None),
        Report.latitude >= -90.0,
        Report.latitude <= 90.0,
        Report.longitude >= -180.0,
        Report.longitude <= 180.0,
        and_(Report.latitude != 0.0, Report.longitude != 0.0),
        Report.duplicate == False,
        Report.status != "duplicate",
    )
    if start_date:
        query = query.where(Report.reported_at >= start_date)
    if end_date:
        query = query.where(Report.reported_at <= end_date)

    query = query.order_by(Report.reported_at.desc(), Report.id.asc())
    reports = list((await db.scalars(query)).all())

    if not reports:
        return HotspotsResponse(
            total_hotspots=0,
            radius_meters=radius_meters,
            min_reports=min_reports,
            hotspots=[],
        )

    # Priority hierarchy for cluster priority determination
    priority_ranks = {"critical": 4, "high": 3, "medium": 2, "low": 1}

    assigned_report_ids = set()
    clusters = []

    # Iteratively find dense clusters
    while True:
        unassigned = [r for r in reports if r.id not in assigned_report_ids]
        if not unassigned:
            break

        best_seed = None
        best_neighbors = []

        for candidate in unassigned:
            c_lat = float(candidate.latitude)
            c_lon = float(candidate.longitude)
            neighbors = [
                other for other in unassigned
                if haversine_distance_meters(c_lat, c_lon, float(other.latitude), float(other.longitude)) <= radius_meters
            ]
            if best_seed is None or len(neighbors) > len(best_neighbors):
                best_seed = candidate
                best_neighbors = neighbors

        if not best_neighbors or len(best_neighbors) < min_reports:
            # Remaining unassigned reports are isolated (< min_reports)
            break

        # Form cluster from best_neighbors
        cluster_members = best_neighbors
        for m in cluster_members:
            assigned_report_ids.add(m.id)

        mean_lat = sum(float(m.latitude) for m in cluster_members) / len(cluster_members)
        mean_lon = sum(float(m.longitude) for m in cluster_members) / len(cluster_members)

        # Dominant waste type
        waste_types = [m.waste_type for m in cluster_members if m.waste_type]
        if waste_types:
            dominant_waste = Counter(waste_types).most_common(1)[0][0]
        else:
            dominant_waste = "unclassified"

        # Max severity
        severities = [m.severity_score for m in cluster_members if m.severity_score is not None]
        max_sev = max(severities) if severities else 0.0

        # Highest priority
        highest_prio = "low"
        highest_prio_rank = 0
        for m in cluster_members:
            p = (m.priority or "medium").lower()
            rank = priority_ranks.get(p, 2)
            if rank > highest_prio_rank:
                highest_prio_rank = rank
                highest_prio = p

        # Address summary
        addresses = [m.address_label for m in cluster_members if m.address_label and m.address_label.strip()]
        address_summary = addresses[0] if addresses else f"Zone near {mean_lat:.4f}° N, {mean_lon:.4f}° E"

        clusters.append({
            "center_lat": round(mean_lat, 6),
            "center_lon": round(mean_lon, 6),
            "report_count": len(cluster_members),
            "primary_waste_type": dominant_waste,
            "max_severity": round(max_sev, 1),
            "primary_priority": highest_prio.upper(),
            "address_summary": address_summary,
            "radius_meters": radius_meters,
        })

    # Sort hotspots: primary report_count DESC, secondary max_severity DESC, tertiary center_lat ASC
    clusters.sort(key=lambda c: (-c["report_count"], -c["max_severity"], c["center_lat"]))

    hotspot_items = [
        HotspotItem(
            id=f"HS-{idx + 1:02d}",
            center_lat=c["center_lat"],
            center_lon=c["center_lon"],
            report_count=c["report_count"],
            primary_waste_type=c["primary_waste_type"],
            max_severity=c["max_severity"],
            primary_priority=c["primary_priority"],
            address_summary=c["address_summary"],
            radius_meters=c["radius_meters"],
        )
        for idx, c in enumerate(clusters)
    ]

    return HotspotsResponse(
        total_hotspots=len(hotspot_items),
        radius_meters=radius_meters,
        min_reports=min_reports,
        hotspots=hotspot_items,
    )
