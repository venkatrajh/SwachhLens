import uuid
from datetime import timedelta, datetime, timezone
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.testclient import TestClient

from app.models.report import Report
from app.services.duplicate_detection import find_duplicate_report
from tests.test_reports import _create_tables, TestSessionLocal, create_test_tables
import pytest_asyncio

@pytest_asyncio.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

pytestmark = pytest.mark.asyncio


async def test_no_duplicate_when_empty(db: AsyncSession):
    report = Report(id=uuid.uuid4(), latitude=10.0, longitude=20.0, user_id=uuid.uuid4())
    dup = await find_duplicate_report(db, report)
    assert dup is None


async def test_no_duplicate_when_no_location(db: AsyncSession):
    report = Report(id=uuid.uuid4(), user_id=uuid.uuid4())
    dup = await find_duplicate_report(db, report)
    assert dup is None


async def test_finds_exact_location_duplicate(db: AsyncSession):
    uid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    r1 = Report(id=uuid.uuid4(), latitude=12.9716, longitude=77.5946, user_id=uid, created_at=now, duplicate=False)
    db.add(r1)
    await db.flush()

    r2 = Report(id=uuid.uuid4(), latitude=12.9716, longitude=77.5946, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is not None
    assert dup.id == r1.id


async def test_finds_nearby_location_duplicate(db: AsyncSession):
    uid = uuid.uuid4()
    # 0.0005 degrees is within the 0.001 radius
    r1 = Report(id=uuid.uuid4(), latitude=10.0000, longitude=10.0000, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    db.add(r1)
    await db.flush()

    r2 = Report(id=uuid.uuid4(), latitude=10.0005, longitude=10.0005, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is not None
    assert dup.id == r1.id


async def test_ignores_distant_report(db: AsyncSession):
    uid = uuid.uuid4()
    # 0.002 degrees is outside the 0.001 radius
    r1 = Report(id=uuid.uuid4(), latitude=10.0000, longitude=10.0000, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    db.add(r1)
    await db.flush()

    r2 = Report(id=uuid.uuid4(), latitude=10.0020, longitude=10.0020, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is None


async def test_ignores_old_report(db: AsyncSession):
    uid = uuid.uuid4()
    old_time = datetime.now(timezone.utc) - timedelta(hours=50)
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, created_at=old_time)
    db.add(r1)
    await db.flush()

    # Even if exact same location, it's older than 48 hours
    r2 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is None


async def test_ignores_different_waste_type(db: AsyncSession):
    uid = uuid.uuid4()
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, waste_type="electronic", created_at=datetime.now(timezone.utc), duplicate=False)
    db.add(r1)
    await db.flush()

    r2 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, waste_type="organic", created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is None


async def test_matches_same_waste_type(db: AsyncSession):
    uid = uuid.uuid4()
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, waste_type="electronic", created_at=datetime.now(timezone.utc), duplicate=False)
    db.add(r1)
    await db.flush()

    r2 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, waste_type="Electronic", created_at=datetime.now(timezone.utc), duplicate=False) # Case insensitive logic used in app
    dup = await find_duplicate_report(db, r2)
    assert dup is not None


async def test_matches_if_one_waste_type_missing(db: AsyncSession):
    uid = uuid.uuid4()
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, waste_type="electronic", created_at=datetime.now(timezone.utc), duplicate=False)
    db.add(r1)
    await db.flush()

    # If the new one doesn't have a waste type yet, proximity is enough
    r2 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is not None


async def test_ignores_already_duplicate(db: AsyncSession):
    uid = uuid.uuid4()
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, duplicate=True, created_at=datetime.now(timezone.utc))
    db.add(r1)
    await db.flush()

    r2 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, created_at=datetime.now(timezone.utc), duplicate=False)
    dup = await find_duplicate_report(db, r2)
    assert dup is None

async def test_finds_duplicate_on_radius_boundary(db: AsyncSession):
    uid = uuid.uuid4()
    now = datetime.now(timezone.utc)
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, created_at=now, duplicate=False)
    db.add(r1)
    await db.flush()
    r2 = Report(id=uuid.uuid4(), latitude=10.001, longitude=10.0, user_id=uid)
    dup = await find_duplicate_report(db, r2)
    assert dup is not None

async def test_duplicate_ignores_different_time_same_location(db: AsyncSession):
    uid = uuid.uuid4()
    old_time = datetime.now(timezone.utc) - timedelta(hours=49)
    r1 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid, created_at=old_time, duplicate=False)
    db.add(r1)
    await db.flush()
    r2 = Report(id=uuid.uuid4(), latitude=10.0, longitude=10.0, user_id=uid)
    dup = await find_duplicate_report(db, r2)
    assert dup is None
