from __future__ import annotations

import logging
import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.team import Team
from app.models.vehicle import Vehicle
from app.schemas.team import TeamCreate, TeamUpdate
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

logger = logging.getLogger(__name__)

# "?"? Teams "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

async def create_team(db: AsyncSession, payload: TeamCreate) -> Team:
    """Create a new team. Raises ValueError if name is duplicated."""
    team = Team(**payload.model_dump())
    db.add(team)
    try:
        await db.flush()
        await db.refresh(team)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Team with name '{payload.name}' already exists.")
    return team

async def get_team(db: AsyncSession, team_id: uuid.UUID) -> Team | None:
    return await db.scalar(select(Team).where(Team.id == team_id))

async def list_teams(db: AsyncSession, active_only: bool = False) -> list[Team]:
    query = select(Team).order_by(Team.name.asc())
    if active_only:
        query = query.where(Team.active == True)
    result = await db.execute(query)
    return list(result.scalars().all())

async def update_team(db: AsyncSession, team: Team, payload: TeamUpdate) -> Team:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)
    try:
        await db.flush()
        await db.refresh(team)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Team with name '{payload.name}' already exists.")
    return team

# "?"? Vehicles "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

async def create_vehicle(db: AsyncSession, payload: VehicleCreate) -> Vehicle:
    """Create a new vehicle. Raises ValueError if plate_number is duplicated."""
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    try:
        await db.flush()
        await db.refresh(vehicle)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Vehicle with plate number '{payload.plate_number}' already exists.")
    return vehicle

async def get_vehicle(db: AsyncSession, vehicle_id: uuid.UUID) -> Vehicle | None:
    return await db.scalar(select(Vehicle).where(Vehicle.id == vehicle_id))

async def list_vehicles(db: AsyncSession, active_only: bool = False) -> list[Vehicle]:
    query = select(Vehicle).order_by(Vehicle.plate_number.asc())
    if active_only:
        query = query.where(Vehicle.active == True)
    result = await db.execute(query)
    return list(result.scalars().all())

async def update_vehicle(db: AsyncSession, vehicle: Vehicle, payload: VehicleUpdate) -> Vehicle:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    try:
        await db.flush()
        await db.refresh(vehicle)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Vehicle with plate number '{payload.plate_number}' already exists.")
    return vehicle
