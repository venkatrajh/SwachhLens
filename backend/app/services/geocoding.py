"""
Reverse geocoding service for SwachhLens.

Resolves GPS coordinates (latitude, longitude) into a human-readable civic address.
Non-blocking and fail-safe: any network failure or timeout falls back immediately
to cleanly formatted coordinate notation, guaranteeing that report creation
never fails due to geocoding.
"""

from __future__ import annotations

import logging
import httpx

logger = logging.getLogger(__name__)

USER_AGENT = "SwachhLens-Civic-Platform/1.0 (contact@swachhlens.app)"


async def reverse_geocode_coordinates(
    latitude: float | None,
    longitude: float | None,
) -> str | None:
    """
    Attempt reverse geocoding using OpenStreetMap Nominatim with a strict 2-second timeout.
    Falls back gracefully to formatted coordinates on any error, timeout, or missing network.
    NEVER raises an exception — report creation must never be blocked.
    """
    if latitude is None or longitude is None:
        return None

    coord_fallback = f"{latitude:.5f}°, {longitude:.5f}°"

    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "format": "jsonv2",
            "lat": latitude,
            "lon": longitude,
            "zoom": 16,
            "addressdetails": 1,
        }
        headers = {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        }
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                addr = data.get("address", {})
                parts = []
                locality = (
                    addr.get("suburb")
                    or addr.get("neighbourhood")
                    or addr.get("road")
                    or addr.get("quarter")
                    or addr.get("residential")
                )
                if locality:
                    parts.append(locality)

                city = (
                    addr.get("city")
                    or addr.get("town")
                    or addr.get("municipality")
                    or addr.get("county")
                )
                if city and city not in parts:
                    parts.append(city)

                state = addr.get("state")
                if state and state not in parts:
                    parts.append(state)

                if parts:
                    return ", ".join(parts)
    except Exception as exc:
        logger.warning("Reverse geocoding unavailable (%s); falling back to coordinates.", exc)

    return coord_fallback
