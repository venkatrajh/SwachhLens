"""
SwachhLens FastAPI application factory.

Usage
-----
Run directly:
    uvicorn app.main:app --reload

Import the app object in tests:
    from app.main import app
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router
from app.core.config import get_settings
from app.core.logging import setup_logging

# ── Bootstrap logging before anything else ───────────────────────────────────
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Modern FastAPI lifespan handler (replaces deprecated @app.on_event).

    Code before `yield` runs on startup; code after runs on shutdown.
    """
    settings = get_settings()
    logger.info(
        "Starting %s v%s [env=%s]",
        settings.app_name,
        settings.app_version,
        settings.environment,
    )
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    """Application factory — creates and configures the FastAPI instance."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "AI-Powered Waste Response Decision Support System. "
            "Backend REST API for SwachhLens."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ──────────────────────────────────────────────────────────────
    app.include_router(api_v1_router, prefix=settings.api_v1_prefix)

    return app


# Module-level app instance used by Uvicorn and tests.
app = create_app()

