"""Initial schema: users, teams, vehicles, reports, report_status_history

Revision ID: 0001
Revises: 
Create Date: 2026-08-19 15:30:00.000000

"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: str | None = None
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=True),
        sa.Column("auth_provider", sa.String(20), server_default="local", nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("role", sa.String(20), server_default="citizen", nullable=False),
        sa.Column("department", sa.String(255), nullable=True),
        sa.Column("ward", sa.String(100), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("reports_submitted", sa.Integer(), server_default="0", nullable=False),
        sa.Column("issues_resolved", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.CheckConstraint(
            "role IN ('citizen','officer','commissioner')", name="ck_users_role"
        ),
        sa.CheckConstraint(
            "auth_provider IN ('local','google')", name="ck_users_auth_provider"
        ),
        sa.CheckConstraint(
            "reports_submitted >= 0", name="ck_users_reports_submitted_non_negative"
        ),
        sa.CheckConstraint(
            "issues_resolved >= 0", name="ck_users_issues_resolved_non_negative"
        ),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── teams ─────────────────────────────────────────────────────────────────
    op.create_table(
        "teams",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_teams_name"),
    )
    op.create_index("ix_teams_name", "teams", ["name"])
    op.create_index("ix_teams_active", "teams", ["active"])

    # ── vehicles ──────────────────────────────────────────────────────────────
    op.create_table(
        "vehicles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plate_number", sa.String(20), nullable=False),
        sa.Column("type", sa.String(50), nullable=True),
        sa.Column("active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("plate_number", name="uq_vehicles_plate_number"),
    )
    op.create_index("ix_vehicles_plate_number", "vehicles", ["plate_number"])
    op.create_index("ix_vehicles_active", "vehicles", ["active"])

    # ── reports ───────────────────────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("video_url", sa.Text(), nullable=True),
        sa.Column("before_image_url", sa.Text(), nullable=True),
        sa.Column("after_image_url", sa.Text(), nullable=True),
        sa.Column("latitude", sa.Numeric(precision=10, scale=7), nullable=True),
        sa.Column("longitude", sa.Numeric(precision=10, scale=7), nullable=True),
        sa.Column("address_label", sa.String(512), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("waste_type", sa.String(100), nullable=True),
        sa.Column("volume_level", sa.String(20), nullable=True),
        sa.Column("estimated_weight_kg", sa.Numeric(precision=8, scale=3), nullable=True),
        sa.Column("severity_score", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("priority", sa.String(20), server_default="medium", nullable=False),
        sa.Column("confidence", sa.Float(), server_default="0", nullable=False),
        sa.Column("duplicate", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("linked_report_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_hazardous", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("is_recyclable", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("recommended_team", sa.String(255), nullable=True),
        sa.Column("recommended_vehicle", sa.String(255), nullable=True),
        sa.Column("recommended_action", sa.Text(), nullable=True),
        sa.Column("assigned_team_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("assigned_vehicle_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("status", sa.String(20), server_default="pending", nullable=False),
        sa.Column("progress", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "reported_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        # ── Primary key ──────────────────────────────────────────────────────
        sa.PrimaryKeyConstraint("id"),
        # ── Foreign keys ─────────────────────────────────────────────────────
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE", name="fk_reports_user_id"
        ),
        sa.ForeignKeyConstraint(
            ["linked_report_id"],
            ["reports.id"],
            ondelete="SET NULL",
            name="fk_reports_linked_report_id",
        ),
        sa.ForeignKeyConstraint(
            ["assigned_team_id"],
            ["teams.id"],
            ondelete="SET NULL",
            name="fk_reports_assigned_team_id",
        ),
        sa.ForeignKeyConstraint(
            ["assigned_vehicle_id"],
            ["vehicles.id"],
            ondelete="SET NULL",
            name="fk_reports_assigned_vehicle_id",
        ),
        # ── Check constraints ─────────────────────────────────────────────────
        sa.CheckConstraint(
            "confidence >= 0 AND confidence <= 1",
            name="ck_reports_confidence_range",
        ),
        sa.CheckConstraint(
            "progress >= 0 AND progress <= 100",
            name="ck_reports_progress_range",
        ),
        sa.CheckConstraint(
            "severity_score >= 0",
            name="ck_reports_severity_non_negative",
        ),
        sa.CheckConstraint(
            "estimated_weight_kg IS NULL OR estimated_weight_kg >= 0",
            name="ck_reports_weight_non_negative",
        ),
        sa.CheckConstraint(
            "latitude IS NULL OR (latitude >= -90 AND latitude <= 90)",
            name="ck_reports_latitude_range",
        ),
        sa.CheckConstraint(
            "longitude IS NULL OR (longitude >= -180 AND longitude <= 180)",
            name="ck_reports_longitude_range",
        ),
        sa.CheckConstraint(
            "volume_level IN ('small','medium','large','very_large')",
            name="ck_reports_volume_level",
        ),
        sa.CheckConstraint(
            "priority IN ('low','medium','high','critical')",
            name="ck_reports_priority",
        ),
        sa.CheckConstraint(
            "status IN ('pending','analyzing','assigned','in_progress',"
            "'completed','verified','duplicate','escalated')",
            name="ck_reports_status",
        ),
    )
    # ── Indexes on reports ────────────────────────────────────────────────────
    op.create_index("ix_reports_user_id", "reports", ["user_id"])
    op.create_index("ix_reports_status", "reports", ["status"])
    op.create_index("ix_reports_priority", "reports", ["priority"])
    op.create_index("ix_reports_waste_type", "reports", ["waste_type"])
    op.create_index("ix_reports_created_at", "reports", ["created_at"])
    op.create_index("ix_reports_reported_at", "reports", ["reported_at"])
    op.create_index("ix_reports_latitude_longitude", "reports", ["latitude", "longitude"])
    op.create_index("ix_reports_assigned_team_id", "reports", ["assigned_team_id"])
    op.create_index("ix_reports_assigned_vehicle_id", "reports", ["assigned_vehicle_id"])
    op.create_index("ix_reports_duplicate", "reports", ["duplicate"])
    op.create_index("ix_reports_linked_report_id", "reports", ["linked_report_id"])

    # ── report_status_history ─────────────────────────────────────────────────
    op.create_table(
        "report_status_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("report_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("label", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["report_id"],
            ["reports.id"],
            ondelete="CASCADE",
            name="fk_rsh_report_id",
        ),
        sa.CheckConstraint(
            "status IN ('pending','analyzing','assigned','in_progress',"
            "'completed','verified','duplicate','escalated')",
            name="ck_rsh_status",
        ),
    )
    op.create_index("ix_rsh_report_id", "report_status_history", ["report_id"])
    op.create_index("ix_rsh_occurred_at", "report_status_history", ["occurred_at"])


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("report_status_history")
    op.drop_table("reports")
    op.drop_table("vehicles")
    op.drop_table("teams")
    op.drop_table("users")
