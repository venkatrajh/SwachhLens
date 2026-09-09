"""
Users management router — /api/v1/users/...

Endpoints
---------
GET   /users/me          Alias — same as /auth/me (convenience)
PATCH /users/me          Update current user profile
GET   /users/{id}        Get a user by ID (officer/commissioner only)
GET   /users             List users (commissioner only)
"""

from __future__ import annotations

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_active_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UpdateProfileRequest, UserResponse
from app.services import auth as auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current user profile (alias for /auth/me)",
)
async def get_me(
    current_user: Annotated[User, Depends(require_active_user)],
) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
)
async def update_me(
    payload: UpdateProfileRequest,
    current_user: Annotated[User, Depends(require_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Update current user's profile information (name, phone, ward, department, avatar_url)."""
    updated_user = await auth_service.update_user_profile(db, current_user, payload)
    return UserResponse.model_validate(updated_user)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID (officer+)",
)
async def get_user(
    user_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_roles("officer", "commissioner"))],
) -> UserResponse:
    """Fetch a single user by UUID. Requires officer or commissioner role."""
    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserResponse.model_validate(user)


@router.get(
    "",
    response_model=list[UserResponse],
    summary="List all users (commissioner only)",
)
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_roles("commissioner"))],
) -> list[UserResponse]:
    """List all users. Requires commissioner role."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]
