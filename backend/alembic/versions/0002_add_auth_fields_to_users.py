"""Add auth fields to users: is_active, is_verified, verification/reset tokens

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-19 17:10:00.000000

Adds to the existing `users` table:
  - is_active      BOOLEAN NOT NULL DEFAULT true
  - is_verified    BOOLEAN NOT NULL DEFAULT false
  - verification_token            TEXT NULLABLE
  - verification_token_expires_at TIMESTAMPTZ NULLABLE
  - reset_token                   TEXT NULLABLE
  - reset_token_expires_at        TIMESTAMPTZ NULLABLE

Does NOT touch any other table or existing column.
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), server_default="false", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("verification_token", sa.Text(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "verification_token_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column("reset_token", sa.Text(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "reset_token_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    # Index for fast token lookups
    op.create_index("ix_users_verification_token", "users", ["verification_token"])
    op.create_index("ix_users_reset_token", "users", ["reset_token"])


def downgrade() -> None:
    op.drop_index("ix_users_reset_token", table_name="users")
    op.drop_index("ix_users_verification_token", table_name="users")
    op.drop_column("users", "reset_token_expires_at")
    op.drop_column("users", "reset_token")
    op.drop_column("users", "verification_token_expires_at")
    op.drop_column("users", "verification_token")
    op.drop_column("users", "is_verified")
    op.drop_column("users", "is_active")
