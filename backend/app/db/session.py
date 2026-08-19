"""
SQLAlchemy async engine and session factory for SwachhLens.

Engine and sessionmaker are created once at module load and reused
across the entire application lifetime.

Usage (in a FastAPI dependency)
--------------------------------
    from app.db.session import get_db

    async def some_endpoint(db: AsyncSession = Depends(get_db)):
        ...
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

settings = get_settings()

# ── Engine ────────────────────────────────────────────────────────────────────
# pool_pre_ping keeps connections alive across Supabase's idle timeouts.
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,          # SQL logging mirrors DEBUG flag
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# ── Session factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,       # objects stay usable after commit
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency — yields a transactional async database session.

    The session is automatically closed (and rolled back on error)
    when the request scope exits.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
