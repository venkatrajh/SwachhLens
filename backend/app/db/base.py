"""
Declarative base for all SQLAlchemy ORM models.

All models must inherit from Base.  Alembic reads Base.metadata to
discover tables for autogenerate migrations.
"""

from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Project-wide SQLAlchemy declarative base."""
    pass
