from __future__ import annotations

import secrets
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import RegisterRequest

logger = logging.getLogger(__name__)


def _now_utc() -> datetime:
    return datetime.now(tz=timezone.utc)


def _is_expired(expires: datetime) -> bool:
    """
    Compare an expiry datetime against the current UTC time.

    Handles both timezone-aware and timezone-naive datetimes — SQLite
    returns naive datetimes while PostgreSQL returns timezone-aware ones.
    We always treat stored datetimes as UTC.
    """
    now = datetime.now(tz=timezone.utc).replace(tzinfo=None)  # naive UTC
    if expires.tzinfo is not None:
        expires = expires.replace(tzinfo=None)  # strip tz for comparison
    return now > expires

def _generate_secure_token() -> str:
    """Generate a 64-character URL-safe random token."""
    return secrets.token_urlsafe(48)


# ── Registration ──────────────────────────────────────────────────────────────

async def register_user(
    db: AsyncSession,
    payload: RegisterRequest,
) -> tuple[User, str]:
    """
    Create a new user account.

    Returns (user, verification_token) — the plain token is returned
    ONCE so it can be emailed. The hash is stored in the DB.

    Raises
    ------
    ValueError
        If the email is already registered.
    """
    # Check for duplicate email (case-insensitive)
    existing = await db.scalar(
        select(User).where(User.email == payload.email.lower())
    )
    if existing is not None:
        raise ValueError("An account with this email already exists.")

    plain_token = _generate_secure_token()
    token_hash = hash_password(plain_token)

    settings = get_settings()
    expires_at = _now_utc() + timedelta(hours=settings.email_verification_expire_hours)

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
        auth_provider="local",
        is_active=True,
        is_verified=False,
        verification_token=token_hash,
        verification_token_expires_at=expires_at,
    )
    db.add(user)
    await db.flush()   # get the id without committing
    logger.info("Registered new user id=%s email=%r role=%r", user.id, user.email, user.role)
    return user, plain_token


# ── Login ─────────────────────────────────────────────────────────────────────

async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> User:
    """
    Verify credentials and return the user.

    Raises
    ------
    ValueError
        On any authentication failure (generic message to avoid enumeration).
    """
    user = await db.scalar(
        select(User).where(User.email == email.lower())
    )

    # Constant-time guard — always hash even on miss to prevent timing attacks
    dummy_hash = "$2b$12$notarealhashjustpadding0000000000000000000000000000000"
    provided_hash = user.password_hash if user else dummy_hash

    if not verify_password(password, provided_hash):
        raise ValueError("Invalid email or password.")

    if user is None:
        raise ValueError("Invalid email or password.")

    if not user.is_active:
        raise ValueError("This account has been deactivated. Please contact support.")

    return user


# ── Email verification ────────────────────────────────────────────────────────

async def verify_email_token(
    db: AsyncSession,
    plain_token: str,
) -> User:
    """
    Validate an email-verification token and mark the user as verified.

    Raises
    ------
    ValueError
        If the token is invalid, expired, or already used.
    """
    # We must check ALL unverified users because the token is stored hashed.
    # Iterate only unverified users with a non-null token.
    result = await db.execute(
        select(User).where(
            User.is_verified.is_(False),
            User.verification_token.isnot(None),
        )
    )
    users = result.scalars().all()

    matched_user: User | None = None
    for candidate in users:
        if candidate.verification_token and verify_password(
            plain_token, candidate.verification_token
        ):
            matched_user = candidate
            break

    if matched_user is None:
        raise ValueError("Invalid or already-used verification token.")

    expires = matched_user.verification_token_expires_at
    if expires is None or _is_expired(expires):
        raise ValueError("Verification token has expired. Please request a new one.")

    # Mark verified and clear the token (single-use)
    matched_user.is_verified = True
    matched_user.verification_token = None
    matched_user.verification_token_expires_at = None
    await db.flush()
    logger.info("Email verified for user id=%s", matched_user.id)
    return matched_user


# ── Password reset ────────────────────────────────────────────────────────────

async def request_password_reset(
    db: AsyncSession,
    email: str,
) -> tuple[User | None, str | None]:
    """
    Generate a password-reset token for the given email.

    Returns (user, plain_token) if found, or (None, None) if not found.
    Callers should send the email only if user is not None, but MUST
    return the same HTTP response regardless (prevent email enumeration).
    """
    user = await db.scalar(
        select(User).where(User.email == email.lower(), User.is_active.is_(True))
    )
    if user is None:
        return None, None

    plain_token = _generate_secure_token()
    token_hash = hash_password(plain_token)

    settings = get_settings()
    expires_at = _now_utc() + timedelta(minutes=settings.password_reset_expire_minutes)

    user.reset_token = token_hash
    user.reset_token_expires_at = expires_at
    await db.flush()
    logger.info("Password reset token issued for user id=%s", user.id)
    return user, plain_token


async def reset_password(
    db: AsyncSession,
    plain_token: str,
    new_password: str,
) -> User:
    """
    Validate a reset token and update the password.

    Raises
    ------
    ValueError
        If the token is invalid or expired.
    """
    result = await db.execute(
        select(User).where(User.reset_token.isnot(None))
    )
    users = result.scalars().all()

    matched_user: User | None = None
    for candidate in users:
        if candidate.reset_token and verify_password(
            plain_token, candidate.reset_token
        ):
            matched_user = candidate
            break

    if matched_user is None:
        raise ValueError("Invalid or already-used reset token.")

    expires = matched_user.reset_token_expires_at
    if expires is None or _is_expired(expires):
        raise ValueError("Reset token has expired. Please request a new one.")

    matched_user.password_hash = hash_password(new_password)
    matched_user.reset_token = None
    matched_user.reset_token_expires_at = None
    await db.flush()
    logger.info("Password reset successfully for user id=%s", matched_user.id)
    return matched_user
