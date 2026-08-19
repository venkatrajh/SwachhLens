"""
Authentication router — /api/v1/auth/...

Endpoints
---------
POST /register          Register a new user
POST /login             Authenticate and receive JWT
GET  /me                Current authenticated user
POST /verify-email      Verify email with token
POST /forgot-password   Request password-reset email
POST /reset-password    Complete password reset
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.dependencies import require_active_user
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
)
from app.services import auth as auth_service
from app.services.email import get_email_service, BrevoEmailService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── POST /auth/register ───────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    email_svc: Annotated[BrevoEmailService, Depends(get_email_service)],
) -> RegisterResponse:
    """
    Register a new local user account.

    - Creates the user with is_verified=False.
    - Generates a secure email-verification token.
    - Sends the verification email via Brevo (non-blocking on failure).
    """
    try:
        user, plain_token = await auth_service.register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    # Send verification email — log but do not crash on failure
    try:
        email_svc.send_verification_email(
            to_email=user.email,
            to_name=user.name,
            token=plain_token,
        )
    except Exception as exc:
        logger.warning("Verification email failed for %s: %s", user.email, exc)

    return RegisterResponse(
        message="Registration successful. Please check your email to verify your account.",
        user=UserResponse.model_validate(user),
    )


# ── POST /auth/login ──────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and receive a JWT",
)
async def login(
    payload: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Authenticate with email + password and receive a JWT access token.
    """
    try:
        user = await auth_service.authenticate_user(db, payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()
    token = create_access_token(
        subject=str(user.id),
        extra_claims={"role": user.role, "email": user.email},
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ── GET /auth/me ──────────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the current authenticated user",
)
async def me(
    current_user: Annotated[User, Depends(require_active_user)],
) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)


# ── POST /auth/verify-email ───────────────────────────────────────────────────

@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Verify email address using token",
)
async def verify_email(
    payload: VerifyEmailRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """
    Verify a user's email address.

    The token is the plain value emailed to the user.
    On success the account is marked as verified.
    """
    try:
        await auth_service.verify_email_token(db, payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return MessageResponse(message="Email verified successfully. You can now log in.")


# ── POST /auth/forgot-password ────────────────────────────────────────────────

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password-reset email",
)
async def forgot_password(
    payload: PasswordResetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    email_svc: Annotated[BrevoEmailService, Depends(get_email_service)],
) -> MessageResponse:
    """
    Trigger a password-reset email.

    Always returns 200 regardless of whether the email exists
    (prevents email enumeration attacks).
    """
    user, plain_token = await auth_service.request_password_reset(db, payload.email)

    if user is not None and plain_token is not None:
        try:
            email_svc.send_password_reset_email(
                to_email=user.email,
                to_name=user.name,
                token=plain_token,
            )
        except Exception as exc:
            logger.warning("Reset email failed for %s: %s", payload.email, exc)

    return MessageResponse(
        message="If an account with that email exists, a password-reset link has been sent."
    )


# ── POST /auth/reset-password ─────────────────────────────────────────────────

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Complete password reset",
)
async def reset_password(
    payload: PasswordResetConfirm,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """
    Reset the password using the token received by email.

    The token is invalidated after use (single-use).
    """
    try:
        await auth_service.reset_password(db, payload.token, payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return MessageResponse(message="Password reset successfully. You can now log in.")
