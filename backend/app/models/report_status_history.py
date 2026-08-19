"""
ReportStatusHistory ORM model.

Powers the citizen event timeline (Kavin's app) and the municipal
complaint timeline (Nakul's dashboard).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReportStatusHistory(Base):
    """Immutable audit trail of status transitions for a report."""

    __tablename__ = "report_status_history"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending','analyzing','assigned','in_progress',"
            "'completed','verified','duplicate','escalated')",
            name="ck_rsh_status",
        ),
        Index("ix_rsh_report_id", "report_id"),
        Index("ix_rsh_occurred_at", "occurred_at"),
    )

    # ── Identity ─────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

    # ── Parent report ─────────────────────────────────────────────────────────
    report_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Event ─────────────────────────────────────────────────────────────────
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)

    # ── Timestamp ─────────────────────────────────────────────────────────────
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    report: Mapped[Report] = relationship(  # type: ignore[name-defined]
        "Report",
        back_populates="status_history",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<ReportStatusHistory id={self.id} "
            f"report_id={self.report_id} status={self.status!r}>"
        )
