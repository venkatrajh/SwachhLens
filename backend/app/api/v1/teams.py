from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.team import TeamCreate, TeamResponse, TeamUpdate
from app.core.dependencies import require_roles
from app.services import fleet

router = APIRouter(tags=["teams"])

@router.get("", response_model=list[TeamResponse], summary="List all teams")
@router.get("/", response_model=list[TeamResponse], include_in_schema=False)
async def list_teams(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
    active_only: bool = False,
) -> list[TeamResponse]:
    teams = await fleet.list_teams(db, active_only=active_only)
    return [TeamResponse.model_validate(t) for t in teams]

@router.post("", response_model=TeamResponse, summary="Create a team")
@router.post("/", response_model=TeamResponse, include_in_schema=False)
async def create_team(
    payload: TeamCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> TeamResponse:
    try:
        team = await fleet.create_team(db, payload)
        await db.commit()
        return TeamResponse.model_validate(team)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{team_id}", response_model=TeamResponse, summary="Get a team")
async def get_team(
    team_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> TeamResponse:
    team = await fleet.get_team(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found.")
    return TeamResponse.model_validate(team)

@router.patch("/{team_id}", response_model=TeamResponse, summary="Update a team")
async def update_team(
    team_id: uuid.UUID,
    payload: TeamUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> TeamResponse:
    team = await fleet.get_team(db, team_id)
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found.")
    try:
        team = await fleet.update_team(db, team, payload)
        await db.commit()
        return TeamResponse.model_validate(team)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
