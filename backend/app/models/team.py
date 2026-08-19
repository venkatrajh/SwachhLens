"""
Team ORM model.

Represents municipal waste-management teams.  Category examples include
general, hazardous, recycling, emergency — but no business logic is
hardcoded here; the category column is a free string.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Team(Base):
    """Municipal waste-response team."""

    __tablename__ = "teams"
    __table_args__ = (
        UniqueConstraint("name", name="uq_teams_name"),
        Index("ix_teams_name", "name"),
        Index("ix_teams_active", "active"),
    )

    # ── Identity ─────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # ── Status ───────────────────────────────────────────────────────────────
    active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )

    # ── Timestamps ───────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    assigned_reports: Mapped[list[Report]] = relationship(  # type: ignore[name-defined]
        "Report",
        back_populates="assigned_team",
        foreign_keys="[Report.assigned_team_id]",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Team id={self.id} name={self.name!r} active={self.active}>"
