"""
Storage service for SwachhLens 2.0.

Provides durable evidence storage, image validation, deterministic server-side
path generation, and orphan cleanup. Supports both local filesystem storage
(for development/testing) and cloud object storage (e.g. Supabase Storage).
"""

from __future__ import annotations

import base64
import logging
import os
import re
import uuid
from pathlib import Path
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Magic byte signatures for supported image types
MAGIC_BYTES: list[tuple[bytes, str, str]] = [
    (b"\xff\xd8\xff", "image/jpeg", "jpg"),
    (b"\x89PNG\r\n\x1a\n", "image/png", "png"),
    (b"RIFF", "image/webp", "webp"),  # WebP begins with 'RIFF' and has 'WEBP' at offset 8
]


def detect_image_format(contents: bytes) -> tuple[str, str]:
    """
    Inspect raw bytes for valid magic-byte signatures.
    Returns (mime_type, file_extension).
    Raises ValueError if format is not supported or corrupt.
    """
    if not contents:
        raise ValueError("Image file is empty (0 bytes).")

    # JPEG
    if contents.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", "jpg"

    # PNG
    if contents.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", "png"

    # WebP: starts with RIFF, length 4 bytes, then 'WEBP' at offset 8
    if len(contents) >= 12 and contents.startswith(b"RIFF") and contents[8:12] == b"WEBP":
        return "image/webp", "webp"

    raise ValueError(
        "Unsupported or invalid image format. Only JPEG, PNG, and WebP images are permitted."
    )


def validate_image_bytes(
    contents: bytes,
    max_size_mb: int | None = None,
    allowed_types: list[str] | None = None,
) -> tuple[str, str]:
    """
    Validate binary image content against file size limits and allowed MIME types.
    Returns (mime_type, file_extension).
    """
    settings = get_settings()
    max_mb = max_size_mb if max_size_mb is not None else settings.storage_max_file_size_mb
    allowed = allowed_types if allowed_types is not None else settings.storage_allowed_types

    max_bytes = max_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise ValueError(
            f"Image file size ({len(contents) / (1024 * 1024):.2f} MB) exceeds "
            f"the maximum allowed limit of {max_mb} MB."
        )

    mime_type, ext = detect_image_format(contents)

    if mime_type.lower() not in [t.lower() for t in allowed]:
        raise ValueError(
            f"MIME type '{mime_type}' is not allowed. Supported formats: {', '.join(allowed)}"
        )

    return mime_type, ext


def decode_base64_image(raw_value: str) -> tuple[bytes, str | None]:
    """
    Extract raw bytes and optional declared MIME type from a Base64 string or Data URI.
    """
    data_uri_match = re.match(r"^data:(image/[a-zA-Z0-9.+_-]+);base64,(.+)$", raw_value, re.DOTALL)
    if data_uri_match:
        declared_mime = data_uri_match.group(1)
        b64_data = data_uri_match.group(2).strip()
        try:
            return base64.b64decode(b64_data), declared_mime
        except Exception as exc:
            raise ValueError(f"Malformed Base64 Data URI: {exc}")

    # Fallback to plain Base64 string
    try:
        return base64.b64decode(raw_value.strip()), None
    except Exception as exc:
        raise ValueError(f"Malformed Base64 payload: {exc}")


def generate_storage_path(
    report_id: uuid.UUID | str,
    evidence_type: str,
    extension: str,
) -> str:
    """
    Generate a deterministic, secure server-side object path.
    Example: reports/550e8400-e29b-41d4-a716-446655440000/before/a1b2c3d4e5f6.jpg
    """
    safe_type = "after" if evidence_type == "after" else "before"
    unique_suffix = uuid.uuid4().hex[:12]
    clean_ext = extension.lstrip(".").lower()
    return f"reports/{report_id}/{safe_type}/{unique_suffix}.{clean_ext}"


def is_legacy_data_uri(url: str | None) -> bool:
    """Check if the given URL is a historical Base64 data URI."""
    if not url:
        return False
    return url.startswith("data:image/")


def is_application_storage_url(url: str | None) -> bool:
    """
    Check if the given URL is a valid application-managed storage URL.
    Recognizes:
    - Local media paths: /media/reports/..., media/reports/...
    - Public base URLs with /media/...
    - Configured Supabase Storage bucket URLs
    """
    if not url:
        return False
    clean = url.strip()
    if clean.startswith("/media/") or clean.startswith("media/"):
        return True
    settings = get_settings()
    if settings.storage_public_base_url:
        base = settings.storage_public_base_url.rstrip("/")
        if clean.startswith(f"{base}/media/"):
            return True
    if settings.supabase_url:
        base_supabase = settings.supabase_url.rstrip("/")
        bucket = settings.supabase_storage_bucket
        if clean.startswith(f"{base_supabase}/storage/v1/object/public/{bucket}/"):
            return True
    return False


async def store_evidence(
    contents: bytes,
    report_id: uuid.UUID | str,
    evidence_type: str = "before",
) -> str:
    """
    Validate and store evidence in the configured object storage backend.
    Returns the retrievable URL or reference path.
    """
    mime_type, ext = validate_image_bytes(contents)
    storage_path = generate_storage_path(report_id, evidence_type, ext)
    settings = get_settings()

    if settings.storage_backend == "supabase":
        return await _store_supabase(contents, storage_path, mime_type)
    else:
        return await _store_local(contents, storage_path)


async def _store_local(contents: bytes, storage_path: str) -> str:
    """Store evidence in the local media directory."""
    settings = get_settings()
    local_dir = Path(settings.storage_local_dir)
    target_file = local_dir / storage_path
    target_file.parent.mkdir(parents=True, exist_ok=True)

    target_file.write_bytes(contents)
    logger.info("Stored evidence locally: %s (%d bytes)", target_file, len(contents))

    if settings.storage_public_base_url:
        base = settings.storage_public_base_url.rstrip("/")
        return f"{base}/media/{storage_path}"
    return f"/media/{storage_path}"


async def _store_supabase(contents: bytes, storage_path: str, mime_type: str) -> str:
    """Upload evidence to Supabase Storage bucket via REST API."""
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        logger.warning(
            "Supabase credentials not fully configured. Falling back to local storage."
        )
        return await _store_local(contents, storage_path)

    bucket = settings.supabase_storage_bucket
    base_url = settings.supabase_url.rstrip("/")
    upload_url = f"{base_url}/storage/v1/object/{bucket}/{storage_path}"

    headers = {
        "Authorization": f"Bearer {settings.supabase_key}",
        "Content-Type": mime_type,
        "x-upsert": "true",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(upload_url, content=contents, headers=headers)
        if response.status_code not in (200, 201):
            logger.error(
                "Supabase Storage upload failed [%s]: %s",
                response.status_code,
                response.text,
            )
            raise RuntimeError(f"Storage upload failed: {response.text}")

    public_url = f"{base_url}/storage/v1/object/public/{bucket}/{storage_path}"
    logger.info("Uploaded evidence to Supabase Storage: %s", public_url)
    return public_url


async def delete_evidence(storage_url_or_path: str) -> bool:
    """
    Attempt deletion of an orphaned evidence object.
    Safe failure — logs error and returns False rather than crashing.
    """
    if not storage_url_or_path or is_legacy_data_uri(storage_url_or_path):
        return True

    settings = get_settings()
    try:
        if storage_url_or_path.startswith("/media/") or storage_url_or_path.startswith("media/"):
            rel_path = storage_url_or_path.lstrip("/")
            if rel_path.startswith("media/"):
                rel_path = rel_path[len("media/"):]
            file_path = Path(settings.storage_local_dir) / rel_path
            if file_path.is_file():
                file_path.unlink()
                logger.info("Deleted orphaned local evidence file: %s", file_path)
                return True
            return True

        if settings.storage_backend == "supabase" and settings.supabase_url in storage_url_or_path:
            bucket = settings.supabase_storage_bucket
            # Extract object path after public/{bucket}/
            marker = f"/public/{bucket}/"
            if marker in storage_url_or_path:
                object_path = storage_url_or_path.split(marker, 1)[1]
                delete_url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{bucket}/{object_path}"
                headers = {"Authorization": f"Bearer {settings.supabase_key}"}
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.delete(delete_url, headers=headers)
                    if resp.status_code in (200, 204):
                        logger.info("Deleted orphaned Supabase evidence: %s", object_path)
                        return True
        return False
    except Exception as exc:
        logger.warning("Failed to delete orphaned evidence %s: %s", storage_url_or_path, exc)
        return False
