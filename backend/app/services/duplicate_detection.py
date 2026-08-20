import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report


async def find_duplicate_report(
    db: AsyncSession,
    report: Report,
    time_window_hours: int = 48,
    radius_degrees: float = 0.001,  # Approx 111 meters at the equator
) -> Report | None:
    """
    Finds a probable duplicate for a given report using deterministic rules.
    
    Checks for reports that are:
    1. Created recently (within time_window_hours).
    2. Geographically close (within bounding box of radius_degrees).
    3. Have the same waste_type (if waste_type is available).
    4. Not already a duplicate themselves.
    """
    if report.latitude is None or report.longitude is None:
        return None

    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=time_window_hours)

    lat_min = float(report.latitude) - radius_degrees
    lat_max = float(report.latitude) + radius_degrees
    lon_min = float(report.longitude) - radius_degrees
    lon_max = float(report.longitude) + radius_degrees

    query = (
        select(Report)
        .where(
            Report.id != report.id,
            Report.created_at >= cutoff_time,
            Report.duplicate == False,
            Report.latitude >= lat_min,
            Report.latitude <= lat_max,
            Report.longitude >= lon_min,
            Report.longitude <= lon_max,
        )
        .order_by(Report.created_at.desc())
    )

    result = await db.execute(query)
    candidates = result.scalars().all()

    for candidate in candidates:
        # If waste_type is determined on both and they differ, they might not be duplicates
        if report.waste_type and candidate.waste_type:
            if report.waste_type.lower() != candidate.waste_type.lower():
                continue
                
        return candidate

    return None
