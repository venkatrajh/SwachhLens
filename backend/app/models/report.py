"""
Report ORM model — the central table of SwachhLens.

Every citizen waste report flows through this table.
Both Kavin's mobile app and Nakul's municipal dashboard operate on it.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Report(Base):
    """
    Waste report — filed by a citizen, processed by the decision engine,
    assigned to a team/vehicle, and verified on completion.

    Status flow
    -----------
    pending → analyzing → assigned → in_progress → completed → verified
                                                             ↘ escalated
    (any) → duplicate
    """

    __tablename__ = "reports"
    __table_args__ = (
        # ── Field-level constraints ───────────────────────────────────────────
        CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="ck_reports_confidence_range",
        ),
        CheckConstraint(
            "progress >= 0 AND progress <= 100",
            name="ck_reports_progress_range",
        ),
        CheckConstraint(
            "severity_score >= 0",
            name="ck_reports_severity_non_negative",
        ),
        CheckConstraint(
            "estimated_weight_kg IS NULL OR estimated_weight_kg >= 0",
            name="ck_reports_weight_non_negative",
        ),
        CheckConstraint(
            "latitude IS NULL OR (latitude >= -90 AND latitude <= 90)",
            name="ck_reports_latitude_range",
        ),
        CheckConstraint(
            "longitude IS NULL OR (longitude >= -180 AND longitude <= 180)",
            name="ck_reports_longitude_range",
        ),
        CheckConstraint(
            "volume_level IN ('small','medium','large','very_large')",
            name="ck_reports_volume_level",
        ),
        CheckConstraint(
            "priority IN ('low','medium','high','critical')",
            name="ck_reports_priority",
        ),
        CheckConstraint(
            "status IN ('pending','analyzing','assigned','in_progress',"
            "'completed','verified','duplicate','escalated')",
            name="ck_reports_status",
        ),
        # ── Indexes ───────────────────────────────────────────────────────────
        Index("ix_reports_user_id", "user_id"),
        Index("ix_reports_status", "status"),
        Index("ix_reports_priority", "priority"),
        Index("ix_reports_waste_type", "waste_type"),
        Index("ix_reports_created_at", "created_at"),
        Index("ix_reports_reported_at", "reported_at"),
        Index("ix_reports_latitude_longitude", "latitude", "longitude"),
        Index("ix_reports_assigned_team_id", "assigned_team_id"),
        Index("ix_reports_assigned_vehicle_id", "assigned_vehicle_id"),
        Index("ix_reports_duplicate", "duplicate"),
        Index("ix_reports_linked_report_id", "linked_report_id"),
    )

    # ── Identity ─────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

    # ── Author ────────────────────────────────────────────────────────────────
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Media ─────────────────────────────────────────────────────────────────
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    before_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    after_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Location ─────────────────────────────────────────────────────────────
    # NUMERIC(10,7) gives ~1 cm precision — sufficient for GPS coordinates.
    latitude: Mapped[float | None] = mapped_column(
        Numeric(precision=10, scale=7), nullable=True
    )
    longitude: Mapped[float | None] = mapped_column(
        Numeric(precision=10, scale=7), nullable=True
    )
    address_label: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # ── Content ───────────────────────────────────────────────────────────────
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── AI / Classification ───────────────────────────────────────────────────
    waste_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    volume_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # NUMERIC(8,3) — enough for tonnes-range weights with 3 dp precision.
    estimated_weight_kg: Mapped[float | None] = mapped_column(
        Numeric(precision=8, scale=3), nullable=True
    )
    # NUMERIC(5,2) — range 0.00–999.99 covers any future severity scale.
    severity_score: Mapped[float | None] = mapped_column(
        Numeric(precision=5, scale=2), nullable=True
    )
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="medium"
    )
    # FLOAT for ML confidence — 0.0 to 1.0
    confidence: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )

    # ── Local CV Perception Provenance (EXP_02 MobileNetV3-Large) ─────────────
    cv_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cv_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    cv_probabilities: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ── Duplicate detection ───────────────────────────────────────────────────
    duplicate: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    linked_report_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reports.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Flags ─────────────────────────────────────────────────────────────────
    is_hazardous: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    is_recyclable: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )

    # ── Decision engine recommendations ──────────────────────────────────────
    recommended_team: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recommended_vehicle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recommended_action: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Assignment ────────────────────────────────────────────────────────────
    assigned_team_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("teams.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_vehicle_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("vehicles.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Workflow state ────────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="pending"
    )
    progress: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
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
    user: Mapped[User] = relationship(  # type: ignore[name-defined]
        "User",
        back_populates="reports",
        foreign_keys=[user_id],
    )

    assigned_team: Mapped[Team | None] = relationship(  # type: ignore[name-defined]
        "Team",
        back_populates="assigned_reports",
        foreign_keys=[assigned_team_id],
    )

    assigned_vehicle: Mapped[Vehicle | None] = relationship(  # type: ignore[name-defined]
        "Vehicle",
        back_populates="assigned_reports",
        foreign_keys=[assigned_vehicle_id],
    )

    # Self-referential: a duplicate report points to its canonical original.
    linked_report: Mapped[Report | None] = relationship(
        "Report",
        back_populates="duplicate_reports",
        foreign_keys=[linked_report_id],
        remote_side="Report.id",
    )
    duplicate_reports: Mapped[list[Report]] = relationship(
        "Report",
        back_populates="linked_report",
        foreign_keys=[linked_report_id],
    )

    status_history: Mapped[list[ReportStatusHistory]] = relationship(  # type: ignore[name-defined]
        "ReportStatusHistory",
        back_populates="report",
        cascade="all, delete-orphan",
        order_by="ReportStatusHistory.occurred_at",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<Report id={self.id} status={self.status!r} "
            f"priority={self.priority!r} waste_type={self.waste_type!r}>"
        )
