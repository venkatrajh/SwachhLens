"""
Authentication router — /api/v1/auth/...

Endpoints
---------
POST /register              Register a new user
POST /login                 Authenticate and receive JWT
GET  /me                    Current authenticated user
POST /verify-email          Verify email with OTP or token
POST /resend-verification   Resend verification OTP
POST /forgot-password       Request password-reset email
POST /reset-password        Complete password reset
POST /change-password       Change password (authenticated)
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.dependencies import require_active_user
from app.core.rate_limit import rate_limit
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    ReactivateAccountRequest,
    ReactivationRequest,
    RegisterRequest,
    RegisterResponse,
    ResendVerificationRequest,
    TokenResponse,
    UserResponse,
    VerifyEmailRequest,
)
from app.services import auth as auth_service
from app.services.email import BrevoEmailService, get_email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Rate limiters for unauthenticated sensitive endpoints (per IP)
register_limiter = rate_limit(max_requests=10, window_seconds=60)
login_limiter = rate_limit(max_requests=10, window_seconds=60)
verify_limiter = rate_limit(max_requests=10, window_seconds=60)
resend_limiter = rate_limit(max_requests=5, window_seconds=60)
forgot_limiter = rate_limit(max_requests=5, window_seconds=60)
reset_limiter = rate_limit(max_requests=5, window_seconds=60)
reactivate_limiter = rate_limit(max_requests=5, window_seconds=60)



# ── POST /auth/register ───────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(register_limiter)],
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
    - Generates a secure 6-digit email-verification OTP.
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
        message="Registration successful. Please check your email for the verification code.",
        user=UserResponse.model_validate(user),
    )


# ── POST /auth/login ──────────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(login_limiter)],
    summary="Log in and receive a JWT",
)
async def login(
    payload: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Authenticate with email + password and receive a JWT access token.

    Unverified users receive HTTP 403 Forbidden with instructions to verify.
    """
    try:
        user = await auth_service.authenticate_user(db, payload.email, payload.password)
    except ValueError as exc:
        msg = str(exc)
        if "not verified" in msg.lower() or "deactivated" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=msg,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=msg,
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


# ── POST /auth/google ─────────────────────────────────────────────────────────

@router.post(
    "/google",
    response_model=TokenResponse,
    dependencies=[Depends(login_limiter)],
    summary="Sign in or register with Google OAuth id_token",
)
async def google_login(
    payload: GoogleAuthRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """
    Authenticate with a Google OAuth ID token.

    Automatically creates a citizen account if user does not exist,
    or authenticates existing user, and returns a JWT access token.
    """
    try:
        user = await auth_service.authenticate_google_user(db, payload.id_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
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
    dependencies=[Depends(verify_limiter)],
    summary="Verify email address using OTP or token",
)
async def verify_email(
    payload: VerifyEmailRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """
    Verify a user's email address using a 6-digit OTP code or verification token.

    On success the account is marked as verified.
    """
    try:
        await auth_service.verify_email_token(db, payload.token, email=payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return MessageResponse(message="Email verified successfully. You can now log in.")


# ── POST /auth/resend-verification ────────────────────────────────────────────

@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    dependencies=[Depends(resend_limiter)],
    summary="Resend verification OTP email",
)
async def resend_verification(
    payload: ResendVerificationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    email_svc: Annotated[BrevoEmailService, Depends(get_email_service)],
) -> MessageResponse:
    """
    Resend a fresh 6-digit OTP code to an unverified account.
    Enforces a 60-second cooldown between requests.
    """
    try:
        user, plain_token = await auth_service.resend_verification_token(db, payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc))

    if user is not None and plain_token is not None:
        try:
            email_svc.send_verification_email(
                to_email=user.email,
                to_name=user.name,
                token=plain_token,
            )
        except Exception as exc:
            logger.warning("Resend verification email failed for %s: %s", user.email, exc)

    return MessageResponse(
        message="If an unverified account with that email exists, a new verification code has been sent."
    )


# ── POST /auth/request-reactivation ───────────────────────────────────────────

@router.post(
    "/request-reactivation",
    response_model=MessageResponse,
    dependencies=[Depends(reactivate_limiter)],
    summary="Request an account reactivation OTP email",
)
async def request_reactivation(
    payload: ReactivationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    email_svc: Annotated[BrevoEmailService, Depends(get_email_service)],
) -> MessageResponse:
    """
    Trigger an account reactivation OTP email for a deactivated user account.

    Always returns 200 to prevent email enumeration.
    """
    try:
        user, plain_token = await auth_service.request_account_reactivation(db, payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(exc))

    if user is not None and plain_token is not None:
        try:
            email_svc.send_reactivation_email(
                to_email=user.email,
                to_name=user.name,
                token=plain_token,
            )
        except Exception as exc:
            logger.warning("Reactivation email failed for %s: %s", user.email, exc)

    return MessageResponse(
        message="If a deactivated account with that email exists, a reactivation code has been sent."
    )


# ── POST /auth/reactivate-account ─────────────────────────────────────────────

@router.post(
    "/reactivate-account",
    response_model=MessageResponse,
    dependencies=[Depends(reactivate_limiter)],
    summary="Complete account reactivation using OTP or token",
)
async def reactivate_account(
    payload: ReactivateAccountRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """
    Reactivate a deactivated user account using the 6-digit OTP code or verification token.
    """
    try:
        await auth_service.reactivate_user_account(db, payload.email, payload.token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return MessageResponse(message="Account successfully reactivated. You can now log in.")


# ── POST /auth/forgot-password ────────────────────────────────────────────────

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    dependencies=[Depends(forgot_limiter)],
    summary="Request a password-reset email",
)
async def forgot_password(
    payload: PasswordResetRequest,
    request: Request,
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
        origin = request.headers.get("origin") or request.headers.get("referer")
        base_url = None
        if origin:
            from urllib.parse import urlparse
            parsed = urlparse(origin)
            if parsed.scheme and parsed.netloc:
                base_url = f"{parsed.scheme}://{parsed.netloc}"

        try:
            email_svc.send_password_reset_email(
                to_email=user.email,
                to_name=user.name,
                token=plain_token,
                base_url=base_url,
                user_role=user.role,
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
    dependencies=[Depends(reset_limiter)],
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


# ── POST /auth/change-password ────────────────────────────────────────────────

@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password (authenticated)",
)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: Annotated[User, Depends(require_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    """
    Change the authenticated user's password.
    Requires current password and a new valid password.
    """
    try:
        await auth_service.change_password(
            db,
            current_user,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return MessageResponse(message="Password changed successfully.")
