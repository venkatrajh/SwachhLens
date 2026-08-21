"""
Notifications router — /api/v1/notifications/...

Endpoints
---------
GET    /notifications                 List current user's notifications
GET    /notifications/unread-count    Get count of unread notifications
PATCH  /notifications/{id}/read       Mark a specific notification as read
POST   /notifications/mark-all-read   Mark all notifications as read
"""

from __future__ import annotations

import math
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
    UnreadCountResponse,
)
from app.services import notification as notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    summary="List notifications for the current user",
)
async def list_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
    is_read: bool | None = Query(None, description="Filter by read status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> NotificationListResponse:
    """
    List notifications. Strictly scoped to the authenticated user.
    """
    items, total = await notification_service.list_notifications(
        db,
        user_id=current_user.id,
        is_read=is_read,
        page=page,
        page_size=page_size,
    )
    pages = math.ceil(total / page_size) if total > 0 else 1

    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get(
    "/unread-count",
    response_model=UnreadCountResponse,
    summary="Get unread notification count",
)
async def get_unread_count(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> UnreadCountResponse:
    """
    Return the total number of unread notifications for the current user.
    """
    count = await notification_service.get_unread_count(db, current_user.id)
    return UnreadCountResponse(unread_count=count)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark a notification as read",
)
async def mark_read(
    notification_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> NotificationResponse:
    """
    Mark a specific notification as read.
    Returns 404 if the notification does not exist or belongs to another user.
    """
    notif = await notification_service.mark_notification_read(
        db, notification_id=notification_id, user_id=current_user.id
    )
    if notif is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )
    await db.commit()
    await db.refresh(notif)
    return NotificationResponse.model_validate(notif)


@router.post(
    "/mark-all-read",
    summary="Mark all notifications as read",
)
async def mark_all_read(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> dict[str, int]:
    """
    Mark all unread notifications for the current user as read.
    """
    updated_count = await notification_service.mark_all_notifications_read(
        db, user_id=current_user.id
    )
    await db.commit()
    return {"updated_count": updated_count}
