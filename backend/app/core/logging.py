"""Structured logging configuration for SwachhLens backend."""

from __future__ import annotations

import logging
import sys

from app.core.config import get_settings


def setup_logging() -> None:
    """
    Configure root logger with a consistent format.

    Format: [LEVEL] YYYY-MM-DD HH:MM:SS | logger_name | message
    Level is read from settings (LOG_LEVEL env var).
    """
    settings = get_settings()

    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="[%(levelname)s] %(asctime)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid duplicate handlers if called more than once (e.g. during tests)
    if not root_logger.handlers:
        root_logger.addHandler(handler)
    else:
        root_logger.handlers.clear()
        root_logger.addHandler(handler)

    # Quieten noisy third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
