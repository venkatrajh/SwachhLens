"""
API v1 router — aggregates all v1 sub-routers.

To add a new feature router:
    from app.api.v1 import my_feature
    router.include_router(my_feature.router, prefix="/my-feature")
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import auth, health, reports, users

router = APIRouter()

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(reports.router)

