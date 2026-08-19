"""
API v1 router — aggregates all v1 sub-routers.

To add a new feature router:
    from app.api.v1 import my_feature
    router.include_router(my_feature.router, prefix="/my-feature")
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import health

router = APIRouter()

router.include_router(health.router)
# Future routers will be added here (reports, auth, ai, etc.)
