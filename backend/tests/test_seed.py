import pytest
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from scripts.seed_fleet import seed_fleet, TEAMS_TO_SEED, VEHICLES_TO_SEED
from app.models.team import Team
from app.models.vehicle import Vehicle
from app.db.base import Base

from sqlalchemy.pool import StaticPool

# In-memory SQLite engine for tests
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    echo=False,
    future=True,
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    # Create all tables in the in-memory database
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Drop all tables after the test
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_seed_fleet_idempotency():
    """
    Test that running seed_fleet() twice:
    1) Creates the expected records the first time.
    2) Does not duplicate or crash on the second run.
    """
    # 1. Run seed script once
    await seed_fleet(session_maker=TestingSessionLocal)
    
    async with TestingSessionLocal() as session:
        # Check teams
        result = await session.execute(select(Team))
        teams = result.scalars().all()
        assert len(teams) >= len(TEAMS_TO_SEED)
        team_names = {t.name for t in teams}
        for expected_team in TEAMS_TO_SEED:
            assert expected_team["name"] in team_names

        # Check vehicles
        result = await session.execute(select(Vehicle))
        vehicles = result.scalars().all()
        assert len(vehicles) >= len(VEHICLES_TO_SEED)
        vehicle_plates = {v.plate_number for v in vehicles}
        for expected_vehicle in VEHICLES_TO_SEED:
            assert expected_vehicle["plate_number"] in vehicle_plates

    # 2. Run seed script again (should be idempotent)
    await seed_fleet(session_maker=TestingSessionLocal)
    
    async with TestingSessionLocal() as session:
        # The counts shouldn't increase
        result = await session.execute(select(Team))
        teams_after = result.scalars().all()
        assert len(teams_after) == len(teams)

        result = await session.execute(select(Vehicle))
        vehicles_after = result.scalars().all()
        assert len(vehicles_after) == len(vehicles)
