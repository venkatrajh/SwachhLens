"""
Alembic migration environment.

- Reads DATABASE_URL from app settings (not from alembic.ini) so that
  no credentials ever need to be committed to the repository.
- Discovers all SQLAlchemy models via `app.models` (single import point).
- Supports both offline (SQL dump) and online (live DB) migration modes.
"""

from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# ── Make sure the backend/ root is on sys.path ────────────────────────────────
# Alembic is run from backend/, so the project root is already on the path.
# This guard handles edge cases (e.g. running from a subdirectory).
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# ── Alembic config object ─────────────────────────────────────────────────────
config = context.config

# ── Logging ───────────────────────────────────────────────────────────────────
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Model metadata ────────────────────────────────────────────────────────────
# Import all models so that Base.metadata includes every table.
import app.models  # noqa: F401, E402  — triggers all model imports
from app.db.base import Base  # noqa: E402

target_metadata = Base.metadata

# ── Database URL ──────────────────────────────────────────────────────────────
# Override the URL from alembic.ini with the value from app settings,
# which in turn reads from the DATABASE_URL environment variable / .env file.
from app.core.config import get_settings  # noqa: E402

_settings = get_settings()
if _settings.database_url:
    config.set_main_option("sqlalchemy.url", _settings.database_url)


# ── Migration runners ─────────────────────────────────────────────────────────

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode (generates SQL without connecting).

    Useful for reviewing migration SQL before applying to production.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode (connects to a live database).
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
