"""
Notification Pydantic schemas.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class NotificationResponse(BaseModel):
    """Schema for returning a single notification."""

    id: uuid.UUID
    user_id: uuid.UUID
    report_id: uuid.UUID | None = None
    event_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    read_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    """Schema for a paginated list of notifications."""

    items: list[NotificationResponse]
    total: int
    page: int
    page_size: int
    pages: int


class UnreadCountResponse(BaseModel):
    """Schema for returning the count of unread notifications."""

    unread_count: int
