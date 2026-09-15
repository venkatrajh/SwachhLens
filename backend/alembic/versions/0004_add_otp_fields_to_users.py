"""add_otp_fields_to_users

Revision ID: 0004
Revises: d1d3d3e230f0
Create Date: 2026-09-09 14:00:00.000000

Adds to the existing `users` table:
  - verification_attempts INTEGER NOT NULL DEFAULT 0
  - verification_sent_at  TIMESTAMPTZ NULLABLE
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0004'
down_revision: Union[str, None] = 'd1d3d3e230f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('verification_attempts', sa.Integer(), server_default='0', nullable=False),
    )
    op.add_column(
        'users',
        sa.Column('verification_sent_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('users', 'verification_sent_at')
    op.drop_column('users', 'verification_attempts')
