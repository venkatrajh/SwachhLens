"""
Configuration & settings for SwachhLens backend.

Settings are read from environment variables (with .env file support).
All values can be overridden at runtime via environment variables.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings loaded from environment variables / .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = "SwachhLens API"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "staging", "production"] = "development"

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Accepts a comma-separated string OR a JSON-style list in the env var.
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ── Logging ──────────────────────────────────────────────────────────────
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    # ── API ──────────────────────────────────────────────────────────────────
    api_v1_prefix: str = "/api/v1"

    # ── Database (Phase 2) ───────────────────────────────────────────────────
    # Format: postgresql+psycopg://user:password@host:5432/dbname
    # Supabase connection strings use the same format via the session pooler.
    database_url: str = ""

    # ── JWT (Phase 3) ────────────────────────────────────────────────────────
    # MUST be set to a long random secret in production.
    jwt_secret_key: str = "CHANGE-ME-IN-PRODUCTION-USE-A-LONG-RANDOM-SECRET"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # ── Email verification / OTP (Phase 1B) ──────────────────────────────────
    email_verification_expire_hours: int = 24
    otp_expire_minutes: int = 15
    otp_resend_cooldown_seconds: int = 60

    # ── Password reset (Phase 3) ─────────────────────────────────────────────
    password_reset_expire_minutes: int = 30


    # ── Brevo (Phase 3) ──────────────────────────────────────────────────────
    brevo_api_key: str = ""
    brevo_sender_email: str = "noreply@swachlens.app"
    brevo_sender_name: str = "SwachhLens"

    # ── Frontend (for email links) ────────────────────────────────────────────
    frontend_base_url: str = "http://localhost:3000"

    # ── AI / Vision (Phase 5: Groq) ──────────────────────────────────────────
    groq_api_key: str | None = None
    groq_model: str = "qwen/qwen3.6-27b"
    groq_timeout: int = 30


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
