"""add_cv_metadata_to_reports

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-11 13:00:00.000000

Adds to the existing `reports` table:
  - cv_model VARCHAR(100) NULLABLE
  - cv_confidence FLOAT NULLABLE
  - cv_probabilities JSON NULLABLE
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0005'
down_revision: Union[str, None] = '0004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'reports',
        sa.Column('cv_model', sa.String(length=100), nullable=True),
    )
    op.add_column(
        'reports',
        sa.Column('cv_confidence', sa.Float(), nullable=True),
    )
    op.add_column(
        'reports',
        sa.Column('cv_probabilities', sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('reports', 'cv_probabilities')
    op.drop_column('reports', 'cv_confidence')
    op.drop_column('reports', 'cv_model')
