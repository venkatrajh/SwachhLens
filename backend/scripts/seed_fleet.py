import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import logging
from sqlalchemy import select

from app.db.session import _get_session_factory
from app.models.team import Team
from app.models.vehicle import Vehicle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Based on app/services/decision_engine.py logic
TEAMS_TO_SEED = [
    {"name": "Hazardous Response Team", "category": "hazardous"},
    {"name": "Heavy Cleanup Crew", "category": "heavy"},
    {"name": "Recycling Team", "category": "recycling"},
    {"name": "Standard Cleanup Crew", "category": "standard"},
    {"name": "General Maintenance", "category": "general"},
]

VEHICLES_TO_SEED = [
    {"plate_number": "HAZ-001", "type": "Hazmat Truck"},
    {"plate_number": "DMP-001", "type": "Dump Truck"},
    {"plate_number": "REC-001", "type": "Recycling Truck"},
    {"plate_number": "STD-001", "type": "Standard Garbage Truck"},
    {"plate_number": "LGT-001", "type": "Light Pickup"},
]

async def seed_fleet(session_maker=None) -> None:
    if session_maker is None:
        session_maker = _get_session_factory()
    async with session_maker() as session:
        # Seed Teams
        for t_data in TEAMS_TO_SEED:
            stmt = select(Team).where(Team.name == t_data["name"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                team = Team(name=t_data["name"], category=t_data["category"], active=True)
                session.add(team)
                logger.info(f"Created team: {t_data['name']}")
            else:
                logger.info(f"Team {t_data['name']} already exists. Skipping.")

        # Seed Vehicles
        for v_data in VEHICLES_TO_SEED:
            stmt = select(Vehicle).where(Vehicle.plate_number == v_data["plate_number"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                # Capacity is omitted as it does not exist in app.models.vehicle.Vehicle
                vehicle = Vehicle(plate_number=v_data["plate_number"], type=v_data["type"], active=True)
                session.add(vehicle)
                logger.info(f"Created vehicle: {v_data['plate_number']} ({v_data['type']})")
            else:
                logger.info(f"Vehicle {v_data['plate_number']} already exists. Skipping.")

        await session.commit()
        logger.info("Fleet seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_fleet())
