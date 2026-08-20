from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.core.dependencies import require_roles
from app.services import fleet

router = APIRouter(tags=["vehicles"])

@router.get("/", response_model=list[VehicleResponse], summary="List all vehicles")
async def list_vehicles(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
    active_only: bool = False,
) -> list[VehicleResponse]:
    return await fleet.list_vehicles(db, active_only=active_only)

@router.post("/", response_model=VehicleResponse, summary="Create a vehicle")
async def create_vehicle(
    payload: VehicleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> VehicleResponse:
    try:
        vehicle = await fleet.create_vehicle(db, payload)
        await db.commit()
        return VehicleResponse.model_validate(vehicle)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{vehicle_id}", response_model=VehicleResponse, summary="Get a vehicle")
async def get_vehicle(
    vehicle_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> VehicleResponse:
    vehicle = await fleet.get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    return VehicleResponse.model_validate(vehicle)

@router.patch("/{vehicle_id}", response_model=VehicleResponse, summary="Update a vehicle")
async def update_vehicle(
    vehicle_id: uuid.UUID,
    payload: VehicleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> VehicleResponse:
    vehicle = await fleet.get_vehicle(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    try:
        vehicle = await fleet.update_vehicle(db, vehicle, payload)
        await db.commit()
        return VehicleResponse.model_validate(vehicle)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
