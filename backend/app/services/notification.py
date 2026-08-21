"""
Notification service — business logic for in-app notifications.

All database operations are async (SQLAlchemy 2.x).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    event_type: str,
    title: str,
    message: str,
    report_id: uuid.UUID | None = None,
) -> Notification:
    """
    Create a single persistent in-app notification.
    """
    notif = Notification(
        user_id=user_id,
        event_type=event_type,
        title=title,
        message=message,
        report_id=report_id,
        is_read=False,
    )
    db.add(notif)
    # Caller is responsible for flushing or committing.
    return notif


async def list_notifications(
    db: AsyncSession,
    user_id: uuid.UUID,
    is_read: bool | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Notification], int]:
    """
    Return (notifications, total_count) for the specified user, paginated.
    """
    query = select(Notification).where(Notification.user_id == user_id)
    
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
        
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Sort newest first
    query = query.order_by(Notification.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    items = list(result.scalars().all())
    
    return items, total or 0


async def get_unread_count(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> int:
    """
    Return the total number of unread notifications for a user.
    """
    query = select(func.count(Notification.id)).where(
        Notification.user_id == user_id,
        Notification.is_read == False,
    )
    count = await db.scalar(query)
    return count or 0


async def mark_notification_read(
    db: AsyncSession,
    notification_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Notification | None:
    """
    Mark a specific notification as read.
    Validates ownership (user_id).
    """
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id
    )
    notif = await db.scalar(query)
    
    if notif and not notif.is_read:
        notif.is_read = True
        notif.read_at = datetime.now(tz=timezone.utc)
        
    return notif


async def mark_all_notifications_read(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> int:
    """
    Mark all unread notifications for the user as read.
    Returns the number of notifications updated.
    """
    # SQLite does not always support returning() with update well without specific setup,
    # so we just execute the update and check rowcount.
    stmt = (
        update(Notification)
        .where(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        .values(
            is_read=True,
            read_at=datetime.now(tz=timezone.utc)
        )
    )
    result = await db.execute(stmt)
    return result.rowcount
