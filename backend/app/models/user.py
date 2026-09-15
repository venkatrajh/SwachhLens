"""
User ORM model.

Represents both citizen users (Kavin's app) and municipal officers/
commissioners (Nakul's dashboard).
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """
    SwachhLens user.

    Roles
    -----
    citizen     — files waste reports via the mobile app
    officer     — municipal field officer who handles assignments
    commissioner — senior municipal official with dashboard access

    Auth providers
    --------------
    local   — email + password_hash
    google  — OAuth (future)
    """

    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        CheckConstraint("role IN ('citizen','officer','commissioner')", name="ck_users_role"),
        CheckConstraint("auth_provider IN ('local','google')", name="ck_users_auth_provider"),
        CheckConstraint("reports_submitted >= 0", name="ck_users_reports_submitted_non_negative"),
        CheckConstraint("issues_resolved >= 0", name="ck_users_issues_resolved_non_negative"),
        Index("ix_users_email", "email"),
        Index("ix_users_verification_token", "verification_token"),
        Index("ix_users_reset_token", "reset_token"),
    )

    # ── Identity ─────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)

    # ── Auth ─────────────────────────────────────────────────────────────────
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    auth_provider: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="local"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="true"
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )

    # ── Email verification token (SHA-256 digest, single-use, expiring) ──────
    verification_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_token_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    verification_attempts: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    verification_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Password reset token (SHA-256 digest, single-use, expiring) ──────────
    reset_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    reset_token_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Profile ──────────────────────────────────────────────────────────────
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="citizen"
    )
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ward: Mapped[str | None] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Gamification / Stats ─────────────────────────────────────────────────
    reports_submitted: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    issues_resolved: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
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
    reports: Mapped[list[Report]] = relationship(  # type: ignore[name-defined]
        "Report",
        back_populates="user",
        foreign_keys="[Report.user_id]",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"

