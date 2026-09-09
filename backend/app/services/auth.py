from __future__ import annotations

import secrets
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import (
    generate_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RegisterRequest, UpdateProfileRequest

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
    return generate_token(48)


def _generate_otp() -> str:
    """Generate a 6-digit numeric OTP code (000000-999999)."""
    return f"{secrets.randbelow(1_000_000):06d}"


# ── Registration ──────────────────────────────────────────────────────────────

async def register_user(
    db: AsyncSession,
    payload: RegisterRequest,
) -> tuple[User, str]:
    """
    Create a new user account with is_verified=False.

    Generates a secure 6-digit verification OTP. The raw OTP is returned
    once for emailing, while its SHA-256 digest is stored in the database.

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

    plain_token = _generate_otp()
    token_hash = hash_token(plain_token)

    settings = get_settings()
    expires_at = _now_utc() + timedelta(minutes=settings.otp_expire_minutes)

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
        ward=payload.ward,
        auth_provider="local",
        is_active=True,
        is_verified=False,
        verification_token=token_hash,
        verification_token_expires_at=expires_at,
        verification_attempts=0,
        verification_sent_at=_now_utc(),
    )
    db.add(user)
    await db.flush()   # get the id without committing
    logger.info("Registered new unverified user id=%s email=%r role=%r", user.id, user.email, user.role)
    return user, plain_token


# ── Login ─────────────────────────────────────────────────────────────────────

async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> User:
    """
    Verify credentials and return the user.
    Enforces active account state and email verification.

    Raises
    ------
    ValueError
        On authentication failure, deactivated account, or unverified email.
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

    if not user.is_verified:
        raise ValueError("Account not verified. Please verify your email before logging in.")

    return user


# ── Email verification / OTP ──────────────────────────────────────────────────

async def verify_email_token(
    db: AsyncSession,
    plain_token: str,
    email: str | None = None,
) -> User:
    """
    Validate an email-verification token or OTP and mark the user as verified.

    Supports:
    - 6-digit OTP with email identifier, attempt tracking (max 5), and lockout.
    - Legacy URL token direct verification via O(1) indexed token lookup.

    Raises
    ------
    ValueError
        If the token is invalid, expired, locked out, or already used.
    """
    token_clean = plain_token.strip()
    token_hash = hash_token(token_clean)

    matched_user: User | None = None

    if email:
        matched_user = await db.scalar(
            select(User).where(User.email == email.lower())
        )
        if matched_user is None:
            raise ValueError("Invalid verification request.")

        if matched_user.is_verified:
            return matched_user

        # Attempt lockout check (max 5 attempts)
        if matched_user.verification_attempts >= 5:
            matched_user.verification_token = None
            matched_user.verification_token_expires_at = None
            await db.commit()
            raise ValueError(
                "Too many failed verification attempts. This code is invalidated. Please request a new code."
            )

        # Check token hash match
        if matched_user.verification_token != token_hash:
            matched_user.verification_attempts += 1
            remaining = max(0, 5 - matched_user.verification_attempts)
            if remaining == 0:
                matched_user.verification_token = None
                matched_user.verification_token_expires_at = None
                await db.commit()
                raise ValueError("Too many failed verification attempts. Please request a new code.")
            await db.commit()
            raise ValueError(f"Invalid verification code. {remaining} attempt(s) remaining.")

    else:
        # Direct token lookup (URL token or test without email)
        matched_user = await db.scalar(
            select(User).where(
                User.verification_token == token_hash,
                User.is_verified.is_(False),
            )
        )
        if matched_user is None:
            matched_user = await _lookup_legacy_verification_token(db, token_clean)

        if matched_user is None:
            raise ValueError("Invalid or already-used verification token.")

        if matched_user.verification_attempts >= 5:
            matched_user.verification_token = None
            matched_user.verification_token_expires_at = None
            await db.flush()
            raise ValueError(
                "Too many failed verification attempts. Please request a new code."
            )

    expires = matched_user.verification_token_expires_at
    if expires is None or _is_expired(expires):
        raise ValueError("Verification token has expired. Please request a new one.")

    # Mark verified and clear the token (single-use)
    matched_user.is_verified = True
    matched_user.verification_token = None
    matched_user.verification_token_expires_at = None
    matched_user.verification_attempts = 0
    await db.flush()
    logger.info("Email verified for user id=%s", matched_user.id)
    return matched_user



async def _lookup_legacy_verification_token(
    db: AsyncSession,
    plain_token: str,
) -> User | None:
    """
    Fallback for legacy tokens hashed with bcrypt prior to Phase 1A upgrade.
    Only queries unverified users whose stored token starts with a bcrypt prefix ('$2').
    """
    result = await db.execute(
        select(User).where(
            User.is_verified.is_(False),
            User.verification_token.like("$2%"),
        )
    )
    for candidate in result.scalars().all():
        if candidate.verification_token and verify_password(
            plain_token, candidate.verification_token
        ):
            return candidate
    return None


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
    token_hash = hash_token(plain_token)

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

    Uses an O(1) indexed SHA-256 token lookup.
    Includes backward-compatible fallback for active legacy bcrypt tokens.

    Raises
    ------
    ValueError
        If the token is invalid or expired.
    """
    token_hash = hash_token(plain_token)
    matched_user = await db.scalar(
        select(User).where(User.reset_token == token_hash)
    )

    # Backward compatibility: fallback to check legacy bcrypt tokens if not found
    if matched_user is None:
        matched_user = await _lookup_legacy_reset_token(db, plain_token)

    if matched_user is None:
        raise ValueError("Invalid or already-used reset token.")

    expires = matched_user.reset_token_expires_at
    if expires is None or _is_expired(expires):
        raise ValueError("Reset token has expired. Please request a new one.")

    # Passwords continue using bcrypt hashing
    matched_user.password_hash = hash_password(new_password)
    matched_user.reset_token = None
    matched_user.reset_token_expires_at = None
    await db.flush()
    logger.info("Password reset successfully for user id=%s", matched_user.id)
    return matched_user


async def _lookup_legacy_reset_token(
    db: AsyncSession,
    plain_token: str,
) -> User | None:
    """
    Fallback for legacy reset tokens hashed with bcrypt prior to Phase 1A upgrade.
    Only queries users whose stored reset token starts with a bcrypt prefix ('$2').
    """
    result = await db.execute(
        select(User).where(User.reset_token.like("$2%"))
    )
    for candidate in result.scalars().all():
        if candidate.reset_token and verify_password(
            plain_token, candidate.reset_token
        ):
            return candidate
    return None


# ── Resend verification OTP ───────────────────────────────────────────────────

async def resend_verification_token(
    db: AsyncSession,
    email: str,
) -> tuple[User | None, str | None]:
    """
    Generate and assign a new verification OTP for an unverified account.

    Enforces a cooldown period (settings.otp_resend_cooldown_seconds) between resends.
    Returns (user, plain_token) or (None, None) if not found or already verified.
    """
    user = await db.scalar(
        select(User).where(User.email == email.lower(), User.is_active.is_(True))
    )
    if user is None or user.is_verified:
        return None, None

    settings = get_settings()

    # Cooldown enforcement
    if user.verification_sent_at is not None:
        # Normalize timezone for SQLite/Postgres compatibility
        now_naive = _now_utc().replace(tzinfo=None)
        sent_naive = user.verification_sent_at.replace(tzinfo=None) if user.verification_sent_at.tzinfo else user.verification_sent_at
        elapsed = (now_naive - sent_naive).total_seconds()
        if elapsed < settings.otp_resend_cooldown_seconds:
            remaining = int(settings.otp_resend_cooldown_seconds - elapsed) + 1
            raise ValueError(f"Please wait {remaining} seconds before requesting a new code.")

    plain_token = _generate_otp()
    token_hash = hash_token(plain_token)
    expires_at = _now_utc() + timedelta(minutes=settings.otp_expire_minutes)

    user.verification_token = token_hash
    user.verification_token_expires_at = expires_at
    user.verification_sent_at = _now_utc()
    user.verification_attempts = 0
    await db.flush()
    logger.info("New verification OTP issued for user id=%s", user.id)
    return user, plain_token


# ── Password change (Authenticated) ──────────────────────────────────────────

async def change_password(
    db: AsyncSession,
    user: User,
    current_password: str,
    new_password: str,
) -> User:
    """
    Verify current credentials and update password using bcrypt.

    Raises
    ------
    ValueError
        If current password does not match or if new password is invalid.
    """
    if not verify_password(current_password, user.password_hash or ""):
        raise ValueError("Incorrect current password.")

    if current_password == new_password:
        raise ValueError("New password cannot be the same as your current password.")

    user.password_hash = hash_password(new_password)
    await db.flush()
    logger.info("Password changed successfully for user id=%s", user.id)
    return user


# ── Profile update ───────────────────────────────────────────────────────────

async def update_user_profile(
    db: AsyncSession,
    user: User,
    payload: UpdateProfileRequest,
) -> User:
    """
    Update authenticated user's profile details.
    """
    if payload.name is not None:
        user.name = payload.name.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip() if payload.phone else None
    if payload.ward is not None:
        user.ward = payload.ward.strip() if payload.ward else None
    if payload.department is not None:
        user.department = payload.department.strip() if payload.department else None
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url.strip() if payload.avatar_url else None

    await db.flush()
    await db.refresh(user)
    logger.info("Profile updated for user id=%s", user.id)
    return user


