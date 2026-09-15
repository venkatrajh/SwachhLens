"""
Pydantic schemas for authentication and user management.

These are the ONLY objects ever serialised over the API wire.
Sensitive fields (password_hash, tokens) are NEVER included in responses.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─────────────────────────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """Payload for POST /api/v1/auth/register."""

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="citizen")
    phone: str | None = Field(default=None, max_length=20)
    ward: str | None = Field(default=None, max_length=100)

    @field_validator("role")
    @classmethod
    def _validate_role(cls, v: str) -> str:
        allowed = {"citizen", "officer", "commissioner"}
        if v not in allowed:
            raise ValueError(f"role must be one of: {', '.join(sorted(allowed))}")
        return v


# ─────────────────────────────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """Payload for POST /api/v1/auth/login."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class GoogleAuthRequest(BaseModel):
    """Payload for POST /api/v1/auth/google."""

    id_token: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """JWT token response returned on successful login."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int   # seconds


# ─────────────────────────────────────────────────────────────────────────────
# User responses — NEVER include password_hash or tokens
# ─────────────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Public user representation — safe to return over the API."""

    id: uuid.UUID
    name: str
    email: str
    role: str
    phone: str | None
    department: str | None
    ward: str | None
    avatar_url: str | None
    is_active: bool
    is_verified: bool
    reports_submitted: int
    issues_resolved: int
    auth_provider: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    """Response after successful registration."""

    message: str
    user: UserResponse


# ─────────────────────────────────────────────────────────────────────────────
# Email verification / OTP
# ─────────────────────────────────────────────────────────────────────────────

class VerifyEmailRequest(BaseModel):
    """Payload for POST /api/v1/auth/verify-email."""

    token: str = Field(..., min_length=1)
    email: EmailStr | None = None


class ResendVerificationRequest(BaseModel):
    """Payload for POST /api/v1/auth/resend-verification."""

    email: EmailStr


class MessageResponse(BaseModel):
    """Generic success message response."""

    message: str


# ─────────────────────────────────────────────────────────────────────────────
# Password reset
# ─────────────────────────────────────────────────────────────────────────────

class PasswordResetRequest(BaseModel):
    """Payload for POST /api/v1/auth/forgot-password."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Payload for POST /api/v1/auth/reset-password."""

    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


# ─────────────────────────────────────────────────────────────────────────────
# Password change (Authenticated)
# ─────────────────────────────────────────────────────────────────────────────

class ChangePasswordRequest(BaseModel):
    """Payload for POST /api/v1/auth/change-password."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


# ─────────────────────────────────────────────────────────────────────────────
# Account Reactivation
# ─────────────────────────────────────────────────────────────────────────────

class ReactivationRequest(BaseModel):
    """Payload for POST /api/v1/auth/request-reactivation."""

    email: EmailStr


class ReactivateAccountRequest(BaseModel):
    """Payload for POST /api/v1/auth/reactivate-account."""

    email: EmailStr
    token: str = Field(..., min_length=1)


# ─────────────────────────────────────────────────────────────────────────────
# Profile update
# ─────────────────────────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    """Payload for PATCH /api/v1/users/me."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    ward: str | None = Field(default=None, max_length=100)
    department: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None)


