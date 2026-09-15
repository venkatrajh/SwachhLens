import sys
import os
import asyncio
import logging

sys.path.insert(0, r"C:\PROJECTS\SwachhLens\backend")

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlalchemy import select
from app.db.session import _get_session_factory
from app.models.user import User
from app.core.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEV_COMMISSIONER = {
    "email": "venkatrajhpr.cse2025@citchennai.net",
    "name": "Municipal Commissioner (General)",
    "role": "commissioner",
    "department": "Solid Waste Management",
    "ward": None,
    "is_active": True,
    "is_verified": True,
    "auth_provider": "local",
    "password": "SwachhLens@2026!Dev"
}

async def seed_municipal_user(session_maker=None) -> dict:
    if session_maker is None:
        session_maker = _get_session_factory()
        
    async with session_maker() as session:
        # Also ensure previous commissioner emails exist with ward=None if needed
        for prev_email in ["commissioner@chennaicorporation.gov.in", "commissioner.zone5@chennaicorporation.gov.in"]:
            stmt_prev = select(User).where(User.email == prev_email)
            res_prev = await session.execute(stmt_prev)
            prev_u = res_prev.scalar_one_or_none()
            if prev_u:
                prev_u.ward = None
                prev_u.password_hash = hash_password(DEV_COMMISSIONER["password"])
                prev_u.is_verified = True
                prev_u.is_active = True

        stmt = select(User).where(User.email == DEV_COMMISSIONER["email"])
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=DEV_COMMISSIONER["email"],
                name=DEV_COMMISSIONER["name"],
                role=DEV_COMMISSIONER["role"],
                department=DEV_COMMISSIONER["department"],
                ward=DEV_COMMISSIONER["ward"],
                is_active=DEV_COMMISSIONER["is_active"],
                is_verified=DEV_COMMISSIONER["is_verified"],
                auth_provider=DEV_COMMISSIONER["auth_provider"],
                password_hash=hash_password(DEV_COMMISSIONER["password"])
            )
            session.add(user)
            await session.commit()
            logger.info(f"Created municipal commissioner user: {DEV_COMMISSIONER['email']}")
        else:
            # Update role, password hash and clear ward
            user.role = DEV_COMMISSIONER["role"]
            user.name = DEV_COMMISSIONER["name"]
            user.ward = None
            user.department = DEV_COMMISSIONER["department"]
            user.password_hash = hash_password(DEV_COMMISSIONER["password"])
            user.is_verified = True
            user.is_active = True
            await session.commit()
            logger.info(f"Updated municipal commissioner user: {DEV_COMMISSIONER['email']} with role={user.role}")
            
        return {
            "email": DEV_COMMISSIONER["email"],
            "role": DEV_COMMISSIONER["role"],
            "password": DEV_COMMISSIONER["password"]
        }

if __name__ == "__main__":
    res = asyncio.run(seed_municipal_user())
    print(f"SEEDED_MUNICIPAL_USER: email={res['email']}, role={res['role']}, password={res['password']}")
