"""
Phase 1B Authentication & Security Test Suite.

Tests:
1. Registration (creation, validation, unverified default, SHA-256 OTP)
2. Login (verified success, unverified 403 rejection, password checking)
3. GET /auth/me (authenticated, expired token, tampered token)
4. Email Verification & OTP (6-digit OTP, attempt lockout at 5, resend cooldown)
5. Password Reset (O(1) SHA-256 token, single-use, expiry, bcrypt passwords)
6. Password Change (authenticated, current password check, bcrypt hash)
7. Profile Update (PATCH /users/me - name, phone, ward)
8. Rate Limiting (in-memory sliding window, HTTP 429, Retry-After header)
9. Role-based Authorization (commissioner, officer, citizen)
10. Security Helpers (hashing, JWT roundtrip, token generation)
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.rate_limit import reset_all_limiters
from app.core.security import (
    create_access_token,
    generate_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.services.email import BrevoEmailService, get_email_service

# ── In-memory SQLite engine for tests ────────────────────────────────────────
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def _create_tables() -> None:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest.fixture(scope="session", autouse=True)
def create_test_tables() -> None:
    """Create all SQLite tables once for the test session."""
    asyncio.run(_create_tables())


@pytest.fixture()
def mock_email() -> MagicMock:
    """A MagicMock that replaces BrevoEmailService."""
    svc = MagicMock(spec=BrevoEmailService)
    return svc


@pytest.fixture(autouse=True)
def override_dependencies(mock_email: MagicMock):
    """Override DB, email service, and reset rate limiters before every test."""
    reset_all_limiters()
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_email_service] = lambda: mock_email
    yield
    app.dependency_overrides.clear()
    reset_all_limiters()


@pytest.fixture()
def client() -> TestClient:
    """TestClient with all dependencies mocked."""
    return TestClient(app, raise_server_exceptions=True)


# ── Helper functions ─────────────────────────────────────────────────────────

def _verify_user_in_db(email: str) -> None:
    """Mark a user account as verified directly in the test database."""
    async def _v() -> None:
        async with TestSessionLocal() as s:
            await s.execute(
                update(User).where(User.email == email.lower()).values(is_verified=True)
            )
            await s.commit()

    asyncio.run(_v())


def _register(
    client: TestClient,
    email: str = "test@example.com",
    auto_verify: bool = True,
    **kwargs,
):
    """Register a test user. If auto_verify=True, marks user as verified in DB."""
    payload = {
        "name": "Test User",
        "email": email,
        "password": "SecurePass1!",
        "role": "citizen",
        **kwargs,
    }
    r = client.post("/api/v1/auth/register", json=payload)
    if r.status_code == 201 and auto_verify:
        _verify_user_in_db(email)
    return r


def _login(
    client: TestClient,
    email: str = "test@example.com",
    password: str = "SecurePass1!",
):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password})


def _auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _unique_email(prefix: str = "u") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


# ─────────────────────────────────────────────────────────────────────────────
# 1. Registration
# ─────────────────────────────────────────────────────────────────────────────

class TestRegistration:

    def test_register_success(self, client: TestClient) -> None:
        email = _unique_email("reg")
        r = _register(client, email=email, auto_verify=False)
        assert r.status_code == 201
        body = r.json()
        assert body["user"]["email"] == email
        assert body["user"]["role"] == "citizen"
        assert body["user"]["is_verified"] is False

    def test_register_duplicate_email(self, client: TestClient) -> None:
        email = _unique_email("dup")
        _register(client, email=email)
        r = _register(client, email=email)
        assert r.status_code == 409
        assert "already exists" in r.json()["detail"].lower()

    def test_register_invalid_email(self, client: TestClient) -> None:
        r = client.post(
            "/api/v1/auth/register",
            json={"name": "X", "email": "not-an-email", "password": "SecurePass1!"},
        )
        assert r.status_code == 422

    def test_register_short_password(self, client: TestClient) -> None:
        r = client.post(
            "/api/v1/auth/register",
            json={"name": "X", "email": _unique_email("shortpw"), "password": "abc"},
        )
        assert r.status_code == 422

    def test_register_invalid_role(self, client: TestClient) -> None:
        r = client.post(
            "/api/v1/auth/register",
            json={
                "name": "X",
                "email": _unique_email("badrole"),
                "password": "SecurePass1!",
                "role": "superadmin",
            },
        )
        assert r.status_code == 422

    def test_register_password_hash_not_in_response(self, client: TestClient) -> None:
        r = _register(client, email=_unique_email("nohash"), auto_verify=False)
        body = r.json()
        assert "password_hash" not in body
        assert "password_hash" not in body.get("user", {})

    def test_register_verification_token_not_in_response(self, client: TestClient) -> None:
        r = _register(client, email=_unique_email("notok"), auto_verify=False)
        body = r.json()
        assert "verification_token" not in body
        assert "verification_token" not in body.get("user", {})

    def test_register_triggers_verification_email(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        _register(client, email=_unique_email("emailsent"), auto_verify=False)
        mock_email.send_verification_email.assert_called_once()

    def test_register_verification_token_stored_as_sha256(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("sha256tok")
        _register(client, email=email, auto_verify=False)
        raw_token = mock_email.send_verification_email.call_args.kwargs["token"]

        async def _check_db() -> None:
            async with TestSessionLocal() as s:
                u = await s.scalar(select(User).where(User.email == email))
                assert u is not None
                assert u.verification_token == hash_token(raw_token)
                assert len(u.verification_token) == 64
                assert not u.verification_token.startswith("$2")
                assert u.verification_token != raw_token

        asyncio.run(_check_db())


# ─────────────────────────────────────────────────────────────────────────────
# 2. Login
# ─────────────────────────────────────────────────────────────────────────────

class TestLogin:

    def test_login_verified_success(self, client: TestClient) -> None:
        email = _unique_email("loginok")
        _register(client, email=email, auto_verify=True)
        r = _login(client, email=email)
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert body["expires_in"] > 0

    def test_login_unverified_blocked(self, client: TestClient) -> None:
        """Unverified accounts must be rejected with HTTP 403 and receive no token."""
        email = _unique_email("unverified")
        _register(client, email=email, auto_verify=False)
        r = _login(client, email=email)
        assert r.status_code == 403
        assert "not verified" in r.json()["detail"].lower()
        assert "access_token" not in r.json()

    def test_login_wrong_password(self, client: TestClient) -> None:
        email = _unique_email("badpw")
        _register(client, email=email, auto_verify=True)
        r = _login(client, email=email, password="WrongPassword!")
        assert r.status_code == 401

    def test_login_unknown_email(self, client: TestClient) -> None:
        r = _login(client, email="nobody_at_all@example.com")
        assert r.status_code == 401

    def test_login_inactive_user(self, client: TestClient) -> None:
        email = _unique_email("inactive")
        _register(client, email=email, auto_verify=True)

        async def _deactivate() -> None:
            async with TestSessionLocal() as s:
                await s.execute(
                    update(User).where(User.email == email).values(is_active=False)
                )
                await s.commit()

        asyncio.run(_deactivate())
        r = _login(client, email=email)
        assert r.status_code == 403
        assert "deactivated" in r.json()["detail"].lower()

    def test_login_token_does_not_contain_password(self, client: TestClient) -> None:
        email = _unique_email("nopwintok")
        _register(client, email=email, auto_verify=True)
        r = _login(client, email=email)
        token = r.json()["access_token"]
        assert "SecurePass" not in token


# ─────────────────────────────────────────────────────────────────────────────
# 3. GET /auth/me
# ─────────────────────────────────────────────────────────────────────────────

class TestMe:

    def test_me_authenticated(self, client: TestClient) -> None:
        email = _unique_email("meauth")
        _register(client, email=email, auto_verify=True)
        token = _login(client, email=email).json()["access_token"]
        r = client.get("/api/v1/auth/me", headers=_auth_header(token))
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == email
        assert "password_hash" not in body
        assert "verification_token" not in body
        assert "reset_token" not in body

    def test_me_unauthenticated(self, client: TestClient) -> None:
        r = client.get("/api/v1/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, client: TestClient) -> None:
        r = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer tampered.token.here"},
        )
        assert r.status_code == 401

    def test_me_expired_token(self, client: TestClient) -> None:
        email = _unique_email("meexp")
        _register(client, email=email, auto_verify=True)

        async def _get_id() -> str:
            async with TestSessionLocal() as s:
                u = await s.scalar(select(User).where(User.email == email))
                return str(u.id)

        uid = asyncio.run(_get_id())
        expired_token = create_access_token(
            subject=uid, expires_delta=timedelta(seconds=-1)
        )
        r = client.get("/api/v1/auth/me", headers=_auth_header(expired_token))
        assert r.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# 4. Email verification & OTP
# ─────────────────────────────────────────────────────────────────────────────

class TestEmailVerification:

    def _register_and_capture_token(
        self, client: TestClient, mock_email: MagicMock, email: str
    ) -> str:
        _register(client, email=email, auto_verify=False)
        return mock_email.send_verification_email.call_args.kwargs["token"]

    def test_verify_email_success(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("verifyok")
        token = self._register_and_capture_token(client, mock_email, email)
        r = client.post("/api/v1/auth/verify-email", json={"token": token})
        assert r.status_code == 200
        assert "verified" in r.json()["message"].lower()

        # Login should now succeed
        assert _login(client, email=email).status_code == 200

    def test_verify_email_with_email_identifier(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("verifyident")
        token = self._register_and_capture_token(client, mock_email, email)
        r = client.post(
            "/api/v1/auth/verify-email",
            json={"token": token, "email": email},
        )
        assert r.status_code == 200
        assert "verified" in r.json()["message"].lower()

    def test_verify_email_invalid_token(self, client: TestClient) -> None:
        r = client.post("/api/v1/auth/verify-email", json={"token": "bogus-token"})
        assert r.status_code == 400

    def test_verify_email_token_reuse_prevented(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("verifyreuse")
        token = self._register_and_capture_token(client, mock_email, email)
        client.post("/api/v1/auth/verify-email", json={"token": token})
        r = client.post("/api/v1/auth/verify-email", json={"token": token})
        assert r.status_code == 400

    def test_verify_email_expired_token(self, client: TestClient) -> None:
        email = _unique_email("verifyexp")
        plain = "plain-token-for-expiry-test"

        async def _setup() -> None:
            async with TestSessionLocal() as s:
                user = User(
                    name="Expired",
                    email=email,
                    password_hash=hash_password("Pass1234!"),
                    auth_provider="local",
                    is_active=True,
                    is_verified=False,
                    verification_token=hash_token(plain),
                    verification_token_expires_at=(
                        datetime.now(tz=timezone.utc) - timedelta(hours=1)
                    ),
                )
                s.add(user)
                await s.commit()

        asyncio.run(_setup())
        r = client.post("/api/v1/auth/verify-email", json={"token": plain})
        assert r.status_code == 400
        assert "expired" in r.json()["detail"].lower()

    def test_verify_email_max_5_attempts_lockout(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("lockout")
        self._register_and_capture_token(client, mock_email, email)

        # 4 incorrect attempts
        for _ in range(4):
            r = client.post(
                "/api/v1/auth/verify-email",
                json={"token": "000000", "email": email},
            )
            assert r.status_code == 400
            assert "remaining" in r.json()["detail"].lower()

        # 5th incorrect attempt -> locks out / invalidates
        r5 = client.post(
            "/api/v1/auth/verify-email",
            json={"token": "000000", "email": email},
        )
        assert r5.status_code == 400
        assert "too many" in r5.json()["detail"].lower()

    def test_resend_verification_cooldown(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("cooldown")
        _register(client, email=email, auto_verify=False)

        # Simulate that 70 seconds have passed since registration
        async def _set_past_cooldown() -> None:
            async with TestSessionLocal() as s:
                await s.execute(
                    update(User)
                    .where(User.email == email.lower())
                    .values(verification_sent_at=datetime.now(timezone.utc) - timedelta(seconds=70))
                )
                await s.commit()

        asyncio.run(_set_past_cooldown())

        # First resend should succeed now that cooldown elapsed
        r1 = client.post("/api/v1/auth/resend-verification", json={"email": email})
        assert r1.status_code == 200

        # Immediate second resend should hit 60-second cooldown
        r2 = client.post("/api/v1/auth/resend-verification", json={"email": email})
        assert r2.status_code == 429
        assert "wait" in r2.json()["detail"].lower()


# ─────────────────────────────────────────────────────────────────────────────
# 5. Password reset
# ─────────────────────────────────────────────────────────────────────────────

class TestPasswordReset:

    def test_forgot_password_always_200(self, client: TestClient) -> None:
        """Non-existent email must return 200 to prevent enumeration."""
        r = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "nobody_resetXXX@example.com"},
        )
        assert r.status_code == 200

    def test_forgot_password_existing_user(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("forgotok")
        _register(client, email=email, auto_verify=True)
        r = client.post("/api/v1/auth/forgot-password", json={"email": email})
        assert r.status_code == 200
        mock_email.send_password_reset_email.assert_called_once()

    def test_reset_password_success(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("resetok")
        _register(client, email=email, auto_verify=True)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        token = mock_email.send_password_reset_email.call_args.kwargs["token"]

        r = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "NewSecure1!"},
        )
        assert r.status_code == 200

        # Old password must no longer work
        assert _login(client, email=email, password="SecurePass1!").status_code == 401
        # New password must work
        assert _login(client, email=email, password="NewSecure1!").status_code == 200

    def test_reset_password_invalid_token(self, client: TestClient) -> None:
        r = client.post(
            "/api/v1/auth/reset-password",
            json={"token": "garbage", "new_password": "NewSecure1!"},
        )
        assert r.status_code == 400

    def test_reset_password_token_reuse_prevented(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("resetreuse")
        _register(client, email=email, auto_verify=True)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        token = mock_email.send_password_reset_email.call_args.kwargs["token"]

        client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "NewSecure1!"},
        )
        r = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "AnotherPass1!"},
        )
        assert r.status_code == 400

    def test_reset_password_expired_token(self, client: TestClient) -> None:
        email = _unique_email("resetexp")
        plain = "plain-reset-token-expired"

        async def _setup() -> None:
            async with TestSessionLocal() as s:
                user = User(
                    name="Expire Reset",
                    email=email,
                    password_hash=hash_password("Pass1234!"),
                    auth_provider="local",
                    is_active=True,
                    is_verified=True,
                    reset_token=hash_token(plain),
                    reset_token_expires_at=(
                        datetime.now(tz=timezone.utc) - timedelta(minutes=1)
                    ),
                )
                s.add(user)
                await s.commit()

        asyncio.run(_setup())
        r = client.post(
            "/api/v1/auth/reset-password",
            json={"token": plain, "new_password": "NewPass1!"},
        )
        assert r.status_code == 400
        assert "expired" in r.json()["detail"].lower()

    def test_reset_short_password_rejected(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("resetshort")
        _register(client, email=email, auto_verify=True)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        token = mock_email.send_password_reset_email.call_args.kwargs["token"]
        r = client.post(
            "/api/v1/auth/reset-password",
            json={"token": token, "new_password": "short"},
        )
        assert r.status_code == 422

    def test_reset_token_stored_as_sha256(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("sha256rst")
        _register(client, email=email, auto_verify=True)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        raw_token = mock_email.send_password_reset_email.call_args.kwargs["token"]

        async def _check_db() -> None:
            async with TestSessionLocal() as s:
                u = await s.scalar(select(User).where(User.email == email))
                assert u is not None
                assert u.reset_token == hash_token(raw_token)
                assert len(u.reset_token) == 64
                assert not u.reset_token.startswith("$2")
                assert u.reset_token != raw_token

        asyncio.run(_check_db())

    def test_password_hash_still_uses_bcrypt_after_reset(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("bcryptchk")
        _register(client, email=email, auto_verify=True)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        raw_token = mock_email.send_password_reset_email.call_args.kwargs["token"]

        r = client.post(
            "/api/v1/auth/reset-password",
            json={"token": raw_token, "new_password": "NewSecurePass1!"},
        )
        assert r.status_code == 200

        async def _check_pw() -> None:
            async with TestSessionLocal() as s:
                u = await s.scalar(select(User).where(User.email == email))
                assert u is not None
                assert u.password_hash.startswith("$2b$")
                assert u.reset_token is None

        asyncio.run(_check_pw())


# ─────────────────────────────────────────────────────────────────────────────
# 6. Change Password (Authenticated)
# ─────────────────────────────────────────────────────────────────────────────

class TestChangePassword:

    def test_change_password_success(self, client: TestClient) -> None:
        email = _unique_email("chgpass")
        _register(client, email=email, auto_verify=True)
        token = _login(client, email=email).json()["access_token"]

        r = client.post(
            "/api/v1/auth/change-password",
            headers=_auth_header(token),
            json={
                "current_password": "SecurePass1!",
                "new_password": "BrandNewPass123!",
            },
        )
        assert r.status_code == 200
        assert "successfully" in r.json()["message"].lower()

        # Old password no longer works
        assert _login(client, email=email, password="SecurePass1!").status_code == 401
        # New password works
        assert _login(client, email=email, password="BrandNewPass123!").status_code == 200

    def test_change_password_wrong_current(self, client: TestClient) -> None:
        email = _unique_email("chgwrong")
        _register(client, email=email, auto_verify=True)
        token = _login(client, email=email).json()["access_token"]

        r = client.post(
            "/api/v1/auth/change-password",
            headers=_auth_header(token),
            json={
                "current_password": "IncorrectPassword!",
                "new_password": "BrandNewPass123!",
            },
        )
        assert r.status_code == 400
        assert "incorrect" in r.json()["detail"].lower()

    def test_change_password_same_password(self, client: TestClient) -> None:
        email = _unique_email("chgsame")
        _register(client, email=email, auto_verify=True)
        token = _login(client, email=email).json()["access_token"]

        r = client.post(
            "/api/v1/auth/change-password",
            headers=_auth_header(token),
            json={
                "current_password": "SecurePass1!",
                "new_password": "SecurePass1!",
            },
        )
        assert r.status_code == 400
        assert "same" in r.json()["detail"].lower()


# ─────────────────────────────────────────────────────────────────────────────
# 7. Profile Update (PATCH /users/me)
# ─────────────────────────────────────────────────────────────────────────────

class TestProfileUpdate:

    def test_update_profile_me_success(self, client: TestClient) -> None:
        email = _unique_email("profupd")
        _register(client, email=email, auto_verify=True)
        token = _login(client, email=email).json()["access_token"]

        r = client.patch(
            "/api/v1/users/me",
            headers=_auth_header(token),
            json={
                "name": "Updated Citizen",
                "phone": "+91 9988776655",
                "ward": "Ward 42 - North Zone",
            },
        )
        assert r.status_code == 200
        body = r.json()
        assert body["name"] == "Updated Citizen"
        assert body["phone"] == "+91 9988776655"
        assert body["ward"] == "Ward 42 - North Zone"

    def test_update_profile_unauthenticated(self, client: TestClient) -> None:
        r = client.patch(
            "/api/v1/users/me",
            json={"name": "Hacker"},
        )
        assert r.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# 8. Rate Limiting
# ─────────────────────────────────────────────────────────────────────────────

class TestRateLimiting:

    def test_rate_limit_login_exceeded(self, client: TestClient) -> None:
        """Rapid repeated login requests must trigger HTTP 429 Too Many Requests."""
        email = _unique_email("ratelimit")
        _register(client, email=email, auto_verify=True)

        responses = []
        # login_limiter is configured for 10 requests per 60 seconds
        for _ in range(12):
            responses.append(_login(client, email=email))

        status_codes = [r.status_code for r in responses]
        assert 429 in status_codes
        r_429 = [r for r in responses if r.status_code == 429][0]
        assert "Retry-After" in r_429.headers


# ─────────────────────────────────────────────────────────────────────────────
# 9. Role-based authorization
# ─────────────────────────────────────────────────────────────────────────────

class TestRoleAuthorization:

    def _make_token(self, client: TestClient, role: str) -> str:
        email = _unique_email(role)
        _register(client, email=email, role=role, auto_verify=True)
        return _login(client, email=email).json()["access_token"]

    def test_commissioner_can_list_users(self, client: TestClient) -> None:
        token = self._make_token(client, "commissioner")
        r = client.get("/api/v1/users", headers=_auth_header(token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_citizen_cannot_list_users(self, client: TestClient) -> None:
        token = self._make_token(client, "citizen")
        r = client.get("/api/v1/users", headers=_auth_header(token))
        assert r.status_code == 403

    def test_officer_cannot_list_users(self, client: TestClient) -> None:
        token = self._make_token(client, "officer")
        r = client.get("/api/v1/users", headers=_auth_header(token))
        assert r.status_code == 403

    def test_officer_can_get_user_by_id(self, client: TestClient) -> None:
        citizen_email = _unique_email("citizenget")
        reg_r = _register(client, email=citizen_email, role="citizen", auto_verify=True)
        citizen_id = reg_r.json()["user"]["id"]
        officer_token = self._make_token(client, "officer")
        r = client.get(
            f"/api/v1/users/{citizen_id}", headers=_auth_header(officer_token)
        )
        assert r.status_code == 200

    def test_citizen_cannot_get_user_by_id(self, client: TestClient) -> None:
        target_email = _unique_email("citizentarget")
        reg_r = _register(client, email=target_email, role="citizen", auto_verify=True)
        target_id = reg_r.json()["user"]["id"]
        citizen_token = self._make_token(client, "citizen")
        r = client.get(
            f"/api/v1/users/{target_id}", headers=_auth_header(citizen_token)
        )
        assert r.status_code == 403

    def test_unauthenticated_cannot_list_users(self, client: TestClient) -> None:
        r = client.get("/api/v1/users")
        assert r.status_code == 401

    def test_sensitive_fields_never_returned(self, client: TestClient) -> None:
        token = self._make_token(client, "commissioner")
        r = client.get("/api/v1/users", headers=_auth_header(token))
        for user_obj in r.json():
            assert "password_hash" not in user_obj
            assert "verification_token" not in user_obj
            assert "reset_token" not in user_obj


# ─────────────────────────────────────────────────────────────────────────────
# 10. Security helpers (pure unit tests)
# ─────────────────────────────────────────────────────────────────────────────

class TestSecurityHelpers:

    def test_hash_password_not_plaintext(self) -> None:
        h = hash_password("mysecret")
        assert h != "mysecret"
        assert h.startswith("$2b$")

    def test_verify_password_correct(self) -> None:
        assert verify_password("correct", hash_password("correct")) is True

    def test_verify_password_wrong(self) -> None:
        assert verify_password("wrong", hash_password("correct")) is False

    def test_jwt_roundtrip(self) -> None:
        token = create_access_token(
            subject="user-123", extra_claims={"role": "citizen"}
        )
        from app.core.security import decode_access_token
        payload = decode_access_token(token)
        assert payload["sub"] == "user-123"
        assert payload["role"] == "citizen"

    def test_jwt_expired_raises(self) -> None:
        from jose import JWTError
        from app.core.security import decode_access_token
        token = create_access_token(
            subject="x", expires_delta=timedelta(seconds=-1)
        )
        with pytest.raises(JWTError):
            decode_access_token(token)

    def test_hash_token_sha256_properties(self) -> None:
        import hashlib
        plain = "secure-random-test-token-12345"
        digest = hash_token(plain)
        assert len(digest) == 64
        assert hash_token(plain) == digest
        assert digest == hashlib.sha256(plain.encode("utf-8")).hexdigest()
        assert hash_token("token-a") != hash_token("token-b")

    def test_generate_token_randomness(self) -> None:
        t1 = generate_token(48)
        t2 = generate_token(48)
        assert len(t1) >= 48
        assert len(t2) >= 48
        assert t1 != t2


# ─────────────────────────────────────────────────────────────────────────────
# 11. Google OAuth Authentication
# ─────────────────────────────────────────────────────────────────────────────

class TestGoogleAuth:

    def test_google_login_new_user_success(self, client: TestClient) -> None:
        resp = client.post(
            "/api/v1/auth/google",
            json={"id_token": "mock_google_token:new_google_citizen@example.com:Google Citizen"},
        )
        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

        # Verify profile via /auth/me
        token = data["access_token"]
        me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        user_data = me_resp.json()
        assert user_data["email"] == "new_google_citizen@example.com"
        assert user_data["name"] == "Google Citizen"
        assert user_data["role"] == "citizen"
        assert user_data["auth_provider"] == "google"
        assert user_data["is_verified"] is True

    def test_google_login_existing_unverified_user_auto_verifies(self, client: TestClient) -> None:
        # Register local user (starts unverified)
        reg_resp = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Local User",
                "email": "local_to_google@example.com",
                "password": "Password123!",
                "role": "citizen",
            },
        )
        assert reg_resp.status_code == 201
        assert reg_resp.json()["user"]["is_verified"] is False

        # Google Sign-in with same email
        resp = client.post(
            "/api/v1/auth/google",
            json={"id_token": "mock_google_token:local_to_google@example.com:Local User"},
        )
        assert resp.status_code == 200
        token = resp.json()["access_token"]

        # Confirm user is now verified
        me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["is_verified"] is True

    def test_google_login_empty_token_rejected(self, client: TestClient) -> None:
        resp = client.post(
            "/api/v1/auth/google",
            json={"id_token": ""},
        )
        assert resp.status_code == 422


# ─────────────────────────────────────────────────────────────────────────────
# 11. Account Reactivation
# ─────────────────────────────────────────────────────────────────────────────

class TestAccountReactivation:

    def test_request_reactivation_success(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("reactivate_req")
        _register(client, email=email, auto_verify=True)

        async def _deactivate() -> None:
            async with TestSessionLocal() as s:
                await s.execute(
                    update(User).where(User.email == email).values(is_active=False, verification_sent_at=None)
                )
                await s.commit()

        asyncio.run(_deactivate())

        # Request reactivation
        resp = client.post("/api/v1/auth/request-reactivation", json={"email": email})
        assert resp.status_code == 200
        assert "reactivation code has been sent" in resp.json()["message"]
        mock_email.send_reactivation_email.assert_called_once()

    def test_request_reactivation_nonexistent_email_returns_200(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        resp = client.post(
            "/api/v1/auth/request-reactivation",
            json={"email": "nonexistent_reactivate@example.com"},
        )
        assert resp.status_code == 200

    def test_reactivate_account_success(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("reactivate_ok")
        _register(client, email=email, auto_verify=True)

        async def _deactivate() -> None:
            async with TestSessionLocal() as s:
                await s.execute(
                    update(User).where(User.email == email).values(is_active=False, verification_sent_at=None)
                )
                await s.commit()

        asyncio.run(_deactivate())

        # Request reactivation to generate token
        client.post("/api/v1/auth/request-reactivation", json={"email": email})
        token = mock_email.send_reactivation_email.call_args.kwargs["token"]

        # Confirm login is currently blocked with 403
        login_fail = _login(client, email=email)
        assert login_fail.status_code == 403

        # Reactivate account
        reactivate_resp = client.post(
            "/api/v1/auth/reactivate-account",
            json={"email": email, "token": token},
        )
        assert reactivate_resp.status_code == 200
        assert "successfully reactivated" in reactivate_resp.json()["message"].lower()

        # Login now succeeds
        login_ok = _login(client, email=email)
        assert login_ok.status_code == 200
        assert "access_token" in login_ok.json()

    def test_reactivate_account_invalid_token_rejected(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("reactivate_badtok")
        _register(client, email=email, auto_verify=True)

        async def _deactivate() -> None:
            async with TestSessionLocal() as s:
                await s.execute(
                    update(User).where(User.email == email).values(is_active=False, verification_sent_at=None)
                )
                await s.commit()

        asyncio.run(_deactivate())

        client.post("/api/v1/auth/request-reactivation", json={"email": email})

        reactivate_resp = client.post(
            "/api/v1/auth/reactivate-account",
            json={"email": email, "token": "999999"},
        )
        assert reactivate_resp.status_code == 400
        assert "invalid" in reactivate_resp.json()["detail"].lower()


