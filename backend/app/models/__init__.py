"""
app/models — SQLAlchemy ORM model definitions.

Import all models here so that Alembic's env.py can discover them
via a single import.
"""

from app.models.user import User  # noqa: F401
from app.models.team import Team  # noqa: F401
from app.models.vehicle import Vehicle  # noqa: F401
from app.models.report import Report  # noqa: F401
from app.models.report_status_history import ReportStatusHistory  # noqa: F401

__all__ = ["User", "Team", "Vehicle", "Report", "ReportStatusHistory"]
