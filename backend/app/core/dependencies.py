"""
FastAPI authentication dependencies.

Provides reusable Depends() callables:
    get_current_user       — validates JWT, returns User or 401
    require_active_user    — same + checks is_active
    require_roles(...)     — role-based access control
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)

_401 = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Authentication required.",
    headers={"WWW-Authenticate": "Bearer"},
)
_403 = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Insufficient permissions.",
)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Decode the Bearer JWT and return the corresponding User.

    Raises HTTP 401 if:
    - No Authorization header
    - Token is missing / malformed / expired / tampered
    - User no longer exists in DB
    """
    import uuid as _uuid

    if credentials is None:
        raise _401

    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise _401
        user_id = _uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise _401

    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise _401

    return user


async def require_active_user(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Like get_current_user but additionally checks is_active.

    Raises HTTP 401 if the account has been deactivated.
    """
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated.",
        )
    return user


def require_roles(*roles: str):
    """
    Dependency factory — enforce role-based access.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("commissioner"))])
        async def admin_endpoint(): ...

    Or as a typed dependency:
        async def endpoint(user: User = Depends(require_roles("officer", "commissioner"))):
    """
    async def _check(
        user: Annotated[User, Depends(require_active_user)],
    ) -> User:
        if user.role not in roles:
            raise _403
        return user

    return _check
