"""
Rate limiting module for SwachhLens API.

Provides lightweight, in-memory sliding-window rate limiting for sensitive
unauthenticated authentication endpoints (login, registration, OTP, password reset).
Zero external dependencies.
"""

from __future__ import annotations

import logging
import threading
import time
from collections import defaultdict, deque
from typing import Callable

from fastapi import HTTPException, Request, status

logger = logging.getLogger(__name__)

_all_limiters: list[RateLimiter] = []


class RateLimiter:
    """
    Sliding-window in-memory rate limiter per client IP.

    Thread-safe implementation using a threading.Lock to guard
    sliding-window history and timestamp deques under concurrent requests.

    Deployment Assumption
    ---------------------
    If deployed behind a reverse proxy (e.g. Nginx, Cloudflare, Traefik),
    the proxy MUST be configured to set or overwrite the X-Forwarded-For
    header so untrusted clients cannot spoof arbitrary IP addresses.
    If no proxy is present, client.host is used as the fallback identifier.

    Parameters
    ----------
    max_requests : int
        Maximum number of requests permitted within the time window.
    window_seconds : int
        Duration of the sliding window in seconds.
    """

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._history: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()
        _all_limiters.append(self)

    def _clean_old(self, timestamps: deque[float], now: float) -> None:
        cutoff = now - self.window_seconds
        while timestamps and timestamps[0] <= cutoff:
            timestamps.popleft()

    def reset(self) -> None:
        """Clear rate limit history (useful for test fixtures)."""
        with self._lock:
            self._history.clear()

    def check(self, request: Request) -> None:
        """
        Evaluate client request against the rate limit window.

        Raises HTTPException(429) if exceeded.
        """
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        elif request.client and request.client.host:
            client_ip = request.client.host
        else:
            client_ip = "unknown"

        now = time.monotonic()
        with self._lock:
            timestamps = self._history[client_ip]
            self._clean_old(timestamps, now)

            if len(timestamps) >= self.max_requests:
                retry_after = max(1, int(self.window_seconds - (now - timestamps[0])))
                logger.warning("Rate limit exceeded for IP %s on %s", client_ip, request.url.path)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Please try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )

            timestamps.append(now)


def rate_limit(max_requests: int, window_seconds: int) -> Callable[[Request], None]:
    """Dependency factory returning a callable rate limiter."""
    limiter = RateLimiter(max_requests=max_requests, window_seconds=window_seconds)
    return limiter.check


def reset_all_limiters() -> None:
    """Clear all registered rate limiter histories."""
    for limiter in _all_limiters:
        limiter.reset()
