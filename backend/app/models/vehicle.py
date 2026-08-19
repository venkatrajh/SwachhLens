"""
Vehicle ORM model.

Represents municipal vehicles available for waste-response assignments.
Type examples: mini, standard, heavy, hazardous, recycling.
No business logic is hardcoded into the type column.
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


class Vehicle(Base):
    """Municipal waste-response vehicle."""

    __tablename__ = "vehicles"
    __table_args__ = (
        UniqueConstraint("plate_number", name="uq_vehicles_plate_number"),
        Index("ix_vehicles_plate_number", "plate_number"),
        Index("ix_vehicles_active", "active"),
    )

    # ── Identity ─────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    plate_number: Mapped[str] = mapped_column(String(20), nullable=False)
    type: Mapped[str | None] = mapped_column(String(50), nullable=True)

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
        back_populates="assigned_vehicle",
        foreign_keys="[Report.assigned_vehicle_id]",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Vehicle id={self.id} plate={self.plate_number!r} type={self.type!r}>"
