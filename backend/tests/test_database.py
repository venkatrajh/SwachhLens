"""
Phase 2 database model tests.

These tests verify the SQLAlchemy metadata structure — no live database
connection is required.  They run entirely in-process using SQLAlchemy's
in-memory inspection APIs.

Phase 1 health tests are NOT affected by these tests.
"""

from __future__ import annotations

import uuid

import pytest
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect

# ── Import models (triggers all model registrations on Base.metadata) ─────────
from app.db.base import Base
import app.models  # noqa: F401 — side-effect import registers all models

from app.models.user import User
from app.models.team import Team
from app.models.vehicle import Vehicle
from app.models.report import Report
from app.models.report_status_history import ReportStatusHistory
from app.core.config import get_settings


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _table(name: str) -> sa.Table:
    """Return the SQLAlchemy Table object for the given table name."""
    return Base.metadata.tables[name]


def _col_names(table_name: str) -> set[str]:
    return {c.name for c in _table(table_name).columns}


# ─────────────────────────────────────────────────────────────────────────────
# 1. Database configuration
# ─────────────────────────────────────────────────────────────────────────────

class TestDatabaseConfig:
    """Settings correctly expose database_url."""

    def test_database_url_field_exists(self) -> None:
        """Settings must have a database_url attribute."""
        settings = get_settings()
        assert hasattr(settings, "database_url")

    def test_database_url_is_string(self) -> None:
        """database_url must be a string (even if empty when no .env present)."""
        settings = get_settings()
        assert isinstance(settings.database_url, str)


# ─────────────────────────────────────────────────────────────────────────────
# 2. All five tables exist in metadata
# ─────────────────────────────────────────────────────────────────────────────

class TestMetadataTables:
    """All five tables must be registered on Base.metadata."""

    EXPECTED_TABLES = {"users", "teams", "vehicles", "reports", "report_status_history"}

    def test_all_tables_present(self) -> None:
        assert self.EXPECTED_TABLES.issubset(Base.metadata.tables.keys())

    def test_users_table(self) -> None:
        assert "users" in Base.metadata.tables

    def test_teams_table(self) -> None:
        assert "teams" in Base.metadata.tables

    def test_vehicles_table(self) -> None:
        assert "vehicles" in Base.metadata.tables

    def test_reports_table(self) -> None:
        assert "reports" in Base.metadata.tables

    def test_report_status_history_table(self) -> None:
        assert "report_status_history" in Base.metadata.tables


# ─────────────────────────────────────────────────────────────────────────────
# 3. users table structure
# ─────────────────────────────────────────────────────────────────────────────

class TestUsersTable:

    REQUIRED_COLS = {
        "id", "name", "email", "password_hash", "phone", "role",
        "department", "ward", "avatar_url", "reports_submitted",
        "issues_resolved", "auth_provider", "created_at", "updated_at",
    }

    def test_required_columns(self) -> None:
        assert self.REQUIRED_COLS.issubset(_col_names("users"))

    def test_email_unique_constraint(self) -> None:
        """users.email must have a unique constraint."""
        table = _table("users")
        unique_cols = {
            col.name
            for uc in table.constraints
            if isinstance(uc, sa.UniqueConstraint)
            for col in uc.columns
        }
        assert "email" in unique_cols

    def test_email_index_exists(self) -> None:
        table = _table("users")
        index_names = {idx.name for idx in table.indexes}
        assert "ix_users_email" in index_names

    def test_id_is_primary_key(self) -> None:
        table = _table("users")
        pk_cols = {c.name for c in table.primary_key}
        assert "id" in pk_cols

    def test_role_check_constraint_exists(self) -> None:
        table = _table("users")
        ck_names = {
            c.name for c in table.constraints if isinstance(c, sa.CheckConstraint)
        }
        assert "ck_users_role" in ck_names

    def test_auth_provider_check_constraint_exists(self) -> None:
        table = _table("users")
        ck_names = {
            c.name for c in table.constraints if isinstance(c, sa.CheckConstraint)
        }
        assert "ck_users_auth_provider" in ck_names

    def test_reports_submitted_non_negative_constraint(self) -> None:
        table = _table("users")
        ck_names = {
            c.name for c in table.constraints if isinstance(c, sa.CheckConstraint)
        }
        assert "ck_users_reports_submitted_non_negative" in ck_names


# ─────────────────────────────────────────────────────────────────────────────
# 4. reports table — foreign keys
# ─────────────────────────────────────────────────────────────────────────────

class TestReportsForeignKeys:

    def _fk_targets(self) -> dict[str, str]:
        """Return {local_col_name: referred_table} for all report FKs."""
        table = _table("reports")
        result = {}
        for fk in table.foreign_keys:
            local_col = fk.parent.name
            referred_table = fk.column.table.name
            result[local_col] = referred_table
        return result

    def test_user_id_fk_to_users(self) -> None:
        assert self._fk_targets().get("user_id") == "users"

    def test_assigned_team_id_fk_to_teams(self) -> None:
        assert self._fk_targets().get("assigned_team_id") == "teams"

    def test_assigned_vehicle_id_fk_to_vehicles(self) -> None:
        assert self._fk_targets().get("assigned_vehicle_id") == "vehicles"

    def test_linked_report_id_self_reference(self) -> None:
        """linked_report_id must reference the reports table itself."""
        assert self._fk_targets().get("linked_report_id") == "reports"

    def test_report_status_history_fk_to_reports(self) -> None:
        table = _table("report_status_history")
        fk_targets = {fk.column.table.name for fk in table.foreign_keys}
        assert "reports" in fk_targets


# ─────────────────────────────────────────────────────────────────────────────
# 5. reports table — check constraints
# ─────────────────────────────────────────────────────────────────────────────

class TestReportsConstraints:

    def _ck_names(self) -> set[str]:
        table = _table("reports")
        return {c.name for c in table.constraints if isinstance(c, sa.CheckConstraint)}

    def test_confidence_range_constraint(self) -> None:
        assert "ck_reports_confidence_range" in self._ck_names()

    def test_progress_range_constraint(self) -> None:
        assert "ck_reports_progress_range" in self._ck_names()

    def test_severity_non_negative_constraint(self) -> None:
        assert "ck_reports_severity_non_negative" in self._ck_names()

    def test_latitude_range_constraint(self) -> None:
        assert "ck_reports_latitude_range" in self._ck_names()

    def test_longitude_range_constraint(self) -> None:
        assert "ck_reports_longitude_range" in self._ck_names()

    def test_volume_level_enum_constraint(self) -> None:
        assert "ck_reports_volume_level" in self._ck_names()

    def test_priority_enum_constraint(self) -> None:
        assert "ck_reports_priority" in self._ck_names()

    def test_status_enum_constraint(self) -> None:
        assert "ck_reports_status" in self._ck_names()


# ─────────────────────────────────────────────────────────────────────────────
# 6. reports table — indexes
# ─────────────────────────────────────────────────────────────────────────────

class TestReportsIndexes:

    def _index_names(self) -> set[str]:
        return {idx.name for idx in _table("reports").indexes}

    def test_user_id_index(self) -> None:
        assert "ix_reports_user_id" in self._index_names()

    def test_status_index(self) -> None:
        assert "ix_reports_status" in self._index_names()

    def test_priority_index(self) -> None:
        assert "ix_reports_priority" in self._index_names()

    def test_lat_lng_index(self) -> None:
        assert "ix_reports_latitude_longitude" in self._index_names()

    def test_assigned_team_index(self) -> None:
        assert "ix_reports_assigned_team_id" in self._index_names()

    def test_duplicate_index(self) -> None:
        assert "ix_reports_duplicate" in self._index_names()


# ─────────────────────────────────────────────────────────────────────────────
# 7. teams table
# ─────────────────────────────────────────────────────────────────────────────

class TestTeamsTable:

    def test_required_columns(self) -> None:
        required = {"id", "name", "category", "active", "created_at", "updated_at"}
        assert required.issubset(_col_names("teams"))

    def test_name_unique_constraint(self) -> None:
        table = _table("teams")
        unique_cols = {
            col.name
            for uc in table.constraints
            if isinstance(uc, sa.UniqueConstraint)
            for col in uc.columns
        }
        assert "name" in unique_cols


# ─────────────────────────────────────────────────────────────────────────────
# 8. vehicles table
# ─────────────────────────────────────────────────────────────────────────────

class TestVehiclesTable:

    def test_required_columns(self) -> None:
        required = {"id", "plate_number", "type", "active", "created_at", "updated_at"}
        assert required.issubset(_col_names("vehicles"))

    def test_plate_number_unique_constraint(self) -> None:
        table = _table("vehicles")
        unique_cols = {
            col.name
            for uc in table.constraints
            if isinstance(uc, sa.UniqueConstraint)
            for col in uc.columns
        }
        assert "plate_number" in unique_cols


# ─────────────────────────────────────────────────────────────────────────────
# 9. report_status_history table
# ─────────────────────────────────────────────────────────────────────────────

class TestReportStatusHistoryTable:

    def test_required_columns(self) -> None:
        required = {"id", "report_id", "label", "status", "occurred_at"}
        assert required.issubset(_col_names("report_status_history"))

    def test_status_check_constraint(self) -> None:
        table = _table("report_status_history")
        ck_names = {c.name for c in table.constraints if isinstance(c, sa.CheckConstraint)}
        assert "ck_rsh_status" in ck_names

    def test_report_id_index(self) -> None:
        idx_names = {idx.name for idx in _table("report_status_history").indexes}
        assert "ix_rsh_report_id" in idx_names


# ─────────────────────────────────────────────────────────────────────────────
# 10. ORM relationship attributes
# ─────────────────────────────────────────────────────────────────────────────

class TestORMRelationships:

    def test_user_has_reports_relationship(self) -> None:
        assert hasattr(User, "reports")

    def test_report_has_user_relationship(self) -> None:
        assert hasattr(Report, "user")

    def test_report_has_assigned_team_relationship(self) -> None:
        assert hasattr(Report, "assigned_team")

    def test_report_has_assigned_vehicle_relationship(self) -> None:
        assert hasattr(Report, "assigned_vehicle")

    def test_report_has_linked_report_self_ref(self) -> None:
        assert hasattr(Report, "linked_report")
        assert hasattr(Report, "duplicate_reports")

    def test_report_has_status_history_relationship(self) -> None:
        assert hasattr(Report, "status_history")

    def test_team_has_assigned_reports_relationship(self) -> None:
        assert hasattr(Team, "assigned_reports")

    def test_vehicle_has_assigned_reports_relationship(self) -> None:
        assert hasattr(Vehicle, "assigned_reports")

    def test_status_history_has_report_relationship(self) -> None:
        assert hasattr(ReportStatusHistory, "report")
