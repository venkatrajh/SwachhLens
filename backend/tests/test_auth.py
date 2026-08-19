"""
Phase 3 Authentication & Authorization Tests.

Strategy
--------
- Uses FastAPI TestClient (synchronous wrapper over async app).
- All database calls are replaced with an in-memory SQLite database
  so tests run without a Supabase/PostgreSQL connection.
- Brevo email service is overridden via FastAPI dependency_overrides
  (not via unittest.mock.patch, which does not work reliably with
  FastAPI's DI system) so NO real HTTP calls are ever made.
- Phase 1 and Phase 2 tests continue to run unchanged.
"""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User  # noqa: F401 — registers model on Base.metadata
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


# ── Session-scoped table creation (sync, avoids event-loop scope conflict) ───

@pytest.fixture(scope="session", autouse=True)
def create_test_tables() -> None:
    """Create all SQLite tables once for the test session."""
    asyncio.run(_create_tables())


# ── Per-test DB + email override ──────────────────────────────────────────────

@pytest.fixture()
def mock_email() -> MagicMock:
    """
    A MagicMock that replaces BrevoEmailService.

    Registered via app.dependency_overrides so FastAPI DI uses it.
    """
    svc = MagicMock(spec=BrevoEmailService)
    return svc


@pytest.fixture(autouse=True)
def override_dependencies(mock_email: MagicMock):
    """
    Override DB and email dependencies for every test.

    Using dependency_overrides is the correct FastAPI way — it works
    regardless of how deep a dependency is injected.
    """
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_email_service] = lambda: mock_email
    yield
    app.dependency_overrides.clear()


@pytest.fixture()
def client() -> TestClient:
    """TestClient with all dependencies mocked."""
    return TestClient(app, raise_server_exceptions=True)


# ── Helper factories ──────────────────────────────────────────────────────────

def _register(client: TestClient, email: str = "test@example.com", **kwargs):
    payload = {
        "name": "Test User",
        "email": email,
        "password": "SecurePass1!",
        "role": "citizen",
        **kwargs,
    }
    return client.post("/api/v1/auth/register", json=payload)


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
        r = _register(client, email=email)
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
        r = client.post("/api/v1/auth/register", json={
            "name": "X", "email": "not-an-email", "password": "SecurePass1!"
        })
        assert r.status_code == 422

    def test_register_short_password(self, client: TestClient) -> None:
        r = client.post("/api/v1/auth/register", json={
            "name": "X", "email": _unique_email("shortpw"), "password": "abc"
        })
        assert r.status_code == 422

    def test_register_invalid_role(self, client: TestClient) -> None:
        r = client.post("/api/v1/auth/register", json={
            "name": "X", "email": _unique_email("badrole"),
            "password": "SecurePass1!", "role": "superadmin"
        })
        assert r.status_code == 422

    def test_register_password_hash_not_in_response(self, client: TestClient) -> None:
        r = _register(client, email=_unique_email("nohash"))
        body = r.json()
        assert "password_hash" not in body
        assert "password_hash" not in body.get("user", {})

    def test_register_verification_token_not_in_response(
        self, client: TestClient
    ) -> None:
        r = _register(client, email=_unique_email("notok"))
        body = r.json()
        assert "verification_token" not in body
        assert "verification_token" not in body.get("user", {})

    def test_register_triggers_verification_email(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        _register(client, email=_unique_email("emailsent"))
        mock_email.send_verification_email.assert_called_once()


# ─────────────────────────────────────────────────────────────────────────────
# 2. Login
# ─────────────────────────────────────────────────────────────────────────────

class TestLogin:

    def test_login_success(self, client: TestClient) -> None:
        email = _unique_email("loginok")
        _register(client, email=email)
        r = _login(client, email=email)
        assert r.status_code == 200
        body = r.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert body["expires_in"] > 0

    def test_login_wrong_password(self, client: TestClient) -> None:
        email = _unique_email("badpw")
        _register(client, email=email)
        r = _login(client, email=email, password="WrongPassword!")
        assert r.status_code == 401

    def test_login_unknown_email(self, client: TestClient) -> None:
        r = _login(client, email="nobody_at_all@example.com")
        assert r.status_code == 401

    def test_login_inactive_user(self, client: TestClient) -> None:
        email = _unique_email("inactive")
        _register(client, email=email)

        async def _deactivate() -> None:
            from sqlalchemy import update
            async with TestSessionLocal() as s:
                await s.execute(
                    update(User).where(User.email == email).values(is_active=False)
                )
                await s.commit()

        asyncio.run(_deactivate())
        r = _login(client, email=email)
        assert r.status_code == 401

    def test_login_token_does_not_contain_password(self, client: TestClient) -> None:
        email = _unique_email("nopwintok")
        _register(client, email=email)
        r = _login(client, email=email)
        token = r.json()["access_token"]
        assert "SecurePass" not in token


# ─────────────────────────────────────────────────────────────────────────────
# 3. GET /auth/me
# ─────────────────────────────────────────────────────────────────────────────

class TestMe:

    def test_me_authenticated(self, client: TestClient) -> None:
        email = _unique_email("meauth")
        _register(client, email=email)
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
        _register(client, email=email)

        async def _get_id() -> str:
            from sqlalchemy import select
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
# 4. Email verification
# ─────────────────────────────────────────────────────────────────────────────

class TestEmailVerification:

    def _register_and_capture_token(
        self, client: TestClient, mock_email: MagicMock, email: str
    ) -> str:
        """Register and return the plain verification token passed to email svc."""
        _register(client, email=email)
        return mock_email.send_verification_email.call_args.kwargs["token"]

    def test_verify_email_success(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("verifyok")
        token = self._register_and_capture_token(client, mock_email, email)
        r = client.post("/api/v1/auth/verify-email", json={"token": token})
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
                    verification_token=hash_password(plain),
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
        _register(client, email=email)
        r = client.post("/api/v1/auth/forgot-password", json={"email": email})
        assert r.status_code == 200
        mock_email.send_password_reset_email.assert_called_once()

    def test_reset_password_success(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("resetok")
        _register(client, email=email)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        token = mock_email.send_password_reset_email.call_args.kwargs["token"]

        r = client.post("/api/v1/auth/reset-password", json={
            "token": token, "new_password": "NewSecure1!",
        })
        assert r.status_code == 200

        # Old password must no longer work
        assert _login(client, email=email, password="SecurePass1!").status_code == 401
        # New password must work
        assert _login(client, email=email, password="NewSecure1!").status_code == 200

    def test_reset_password_invalid_token(self, client: TestClient) -> None:
        r = client.post("/api/v1/auth/reset-password", json={
            "token": "garbage", "new_password": "NewSecure1!"
        })
        assert r.status_code == 400

    def test_reset_password_token_reuse_prevented(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("resetreuse")
        _register(client, email=email)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        token = mock_email.send_password_reset_email.call_args.kwargs["token"]

        client.post("/api/v1/auth/reset-password", json={
            "token": token, "new_password": "NewSecure1!"
        })
        r = client.post("/api/v1/auth/reset-password", json={
            "token": token, "new_password": "AnotherPass1!"
        })
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
                    reset_token=hash_password(plain),
                    reset_token_expires_at=(
                        datetime.now(tz=timezone.utc) - timedelta(minutes=1)
                    ),
                )
                s.add(user)
                await s.commit()

        asyncio.run(_setup())
        r = client.post("/api/v1/auth/reset-password", json={
            "token": plain, "new_password": "NewPass1!"
        })
        assert r.status_code == 400
        assert "expired" in r.json()["detail"].lower()

    def test_reset_short_password_rejected(
        self, client: TestClient, mock_email: MagicMock
    ) -> None:
        email = _unique_email("resetshort")
        _register(client, email=email)
        client.post("/api/v1/auth/forgot-password", json={"email": email})
        token = mock_email.send_password_reset_email.call_args.kwargs["token"]
        r = client.post("/api/v1/auth/reset-password", json={
            "token": token, "new_password": "short"
        })
        assert r.status_code == 422


# ─────────────────────────────────────────────────────────────────────────────
# 6. Role-based authorization
# ─────────────────────────────────────────────────────────────────────────────

class TestRoleAuthorization:

    def _make_token(self, client: TestClient, role: str) -> str:
        email = _unique_email(role)
        _register(client, email=email, role=role)
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
        reg_r = _register(client, email=citizen_email, role="citizen")
        citizen_id = reg_r.json()["user"]["id"]
        officer_token = self._make_token(client, "officer")
        r = client.get(
            f"/api/v1/users/{citizen_id}", headers=_auth_header(officer_token)
        )
        assert r.status_code == 200

    def test_citizen_cannot_get_user_by_id(self, client: TestClient) -> None:
        target_email = _unique_email("citizentarget")
        reg_r = _register(client, email=target_email, role="citizen")
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
# 7. Security helpers (pure unit tests — no DB, no HTTP)
# ─────────────────────────────────────────────────────────────────────────────

class TestSecurityHelpers:

    def test_hash_password_not_plaintext(self) -> None:
        h = hash_password("mysecret")
        assert h != "mysecret"
        assert h.startswith("$2b$")

    def test_verify_password_correct(self) -> None:
        from app.core.security import verify_password
        assert verify_password("correct", hash_password("correct")) is True

    def test_verify_password_wrong(self) -> None:
        from app.core.security import verify_password
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
