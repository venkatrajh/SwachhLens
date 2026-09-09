"""
Security utilities — password hashing and JWT token handling.

No secrets are stored in this file.
All secrets come from app settings (environment variables).
"""

from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# ── Password hashing (bcrypt) ────────────────────────────────────────────────
# Passwords use slow, salted bcrypt hashing with work factor ~12.
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plaintext: str) -> str:
    """Return a bcrypt hash of the given plaintext password."""
    return _pwd_context.hash(plaintext)


def verify_password(plaintext: str, hashed: str) -> bool:
    """Return True if plaintext matches the bcrypt hash."""
    return _pwd_context.verify(plaintext, hashed)


# ── Verification & Reset Tokens (Deterministic SHA-256) ──────────────────────
# High-entropy random tokens use deterministic SHA-256 hex digests.
# This enables fast O(1) indexed database lookups without salt variation.
# Passwords MUST NOT use this (passwords must continue using hash_password/bcrypt).

def generate_token(nbytes: int = 48) -> str:
    """Generate a cryptographically secure URL-safe random token string."""
    return secrets.token_urlsafe(nbytes)


def hash_token(plain_token: str) -> str:
    """
    Return the deterministic hex-encoded SHA-256 digest of a raw token.

    Used exclusively for high-entropy random verification and reset tokens.
    """
    return hashlib.sha256(plain_token.encode("utf-8")).hexdigest()



# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a signed JWT access token.

    Parameters
    ----------
    subject:
        The token subject — typically the user's UUID as a string.
    extra_claims:
        Optional additional claims to embed (e.g. role, email).
    expires_delta:
        Override the default expiry from settings.
    """
    settings = get_settings()
    now = datetime.now(tz=timezone.utc)
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = now + expires_delta

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expire,
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT access token.

    Raises
    ------
    jose.JWTError
        If the token is invalid, expired, or tampered.
    """
    settings = get_settings()
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
