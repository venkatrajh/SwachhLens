from datetime import date
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class AnalyticsSummaryResponse(BaseModel):
    total_reports: int
    status_counts: Dict[str, int]
    priority_counts: Dict[str, int]
    waste_type_counts: Dict[str, int]
    hazardous_count: int
    recyclable_count: int
    duplicate_count: int


class WorkloadItem(BaseModel):
    id: str
    name_or_plate: str
    active_reports_count: int

    model_config = ConfigDict(from_attributes=True)


class FleetWorkloadResponse(BaseModel):
    total_teams: int
    active_teams: int
    total_vehicles: int
    active_vehicles: int
    team_workload: List[WorkloadItem]
    vehicle_workload: List[WorkloadItem]


class PerformanceResponse(BaseModel):
    completed_report_count: int
    verified_report_count: int
    pending_resolution_count: int
    average_resolution_duration_seconds: Optional[float] = None
    average_verification_duration_seconds: Optional[float] = None


class TrendItem(BaseModel):
    date_label: str
    submitted_count: int
    completed_count: int


class TrendsResponse(BaseModel):
    interval: str
    trends: List[TrendItem]
