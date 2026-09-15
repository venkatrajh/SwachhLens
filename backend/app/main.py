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
import os
import sys

# Windows asyncio workaround for uvicorn
if sys.platform == "win32":
    import asyncio
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api.v1.router import router as api_v1_router
from app.core.config import get_settings
from app.core.logging import setup_logging

# ── Bootstrap logging before anything else ───────────────────────────────────
setup_logging()
logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds standard security response headers to all outgoing responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.exception("Exception in request %s %s: %s", request.method, request.url, exc)
            raise exc
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Modern FastAPI lifespan handler (replaces deprecated @app.on_event).

    Code before `yield` runs on startup; code after runs on shutdown.
    """
    settings = get_settings()
    if settings.environment == "production":
        if not settings.jwt_secret_key or settings.jwt_secret_key.startswith("CHANGE-ME"):
            raise RuntimeError(
                "CRITICAL SECURITY ERROR: jwt_secret_key must be configured with a secure random secret in production!"
            )
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

    is_production = settings.environment == "production"

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "AI-Powered Waste Response Decision Support System. "
            "Backend REST API for SwachhLens."
        ),
        docs_url=None if is_production else "/docs",
        redoc_url=None if is_production else "/redoc",
        openapi_url=None if is_production else "/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────────────────
    cors_kwargs = {
        "allow_origins": settings.cors_origins,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if not is_production:
        cors_kwargs["allow_origin_regex"] = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    app.add_middleware(CORSMiddleware, **cors_kwargs)

    # ── Security Response Headers (Phase 10: F-SEC-04) ───────────────────────
    app.add_middleware(SecurityHeadersMiddleware)

    # ── GZip Response Compression (Phase 10: F-PERF-01) ──────────────────────
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # ── Routers ──────────────────────────────────────────────────────────────
    app.include_router(api_v1_router, prefix=settings.api_v1_prefix)

    # ── Media Static Files (Phase 3) ─────────────────────────────────────────
    from pathlib import Path
    from fastapi.staticfiles import StaticFiles

    media_path = Path(settings.storage_local_dir)
    media_path.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

    # ── Exception Handler ────────────────────────────────────────────────────
    from fastapi.responses import JSONResponse
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Global unhandled exception on %s %s: %s", request.method, request.url, exc)
        detail = str(exc) if settings.environment == "development" else "Internal server error"
        return JSONResponse(status_code=500, content={"detail": detail})

    return app


# Module-level app instance used by Uvicorn and tests.
app = create_app()

