import json
import logging
import re
from typing import Any

import httpx
from pydantic import ValidationError

from app.core.config import get_settings
from app.schemas.ai import AIAnalysisResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert municipal waste analyst AI.
You must analyze the provided waste report details and image (if available) to determine its characteristics.

You MUST respond with a valid JSON object matching this EXACT schema:
{
  "waste_type": "string (e.g. household, construction, organic, medical, electronic)",
  "volume_level": "string (exactly one of: 'small', 'medium', 'large', 'very_large')",
  "confidence": float (between 0.0 and 1.0),
  "severity_score": float (between 0.0 and 100.0),
  "estimated_weight_kg": float (non-negative),
  "is_hazardous": boolean,
  "is_recyclable": boolean,
  "recommended_action": "string (brief action for municipal workers)"
}

Do not include markdown code blocks. Output ONLY the raw JSON object.
"""

VOLUME_LEVEL_MAP: dict[str, str] = {
    "small": "small",
    "low": "small",
    "minor": "small",
    "tiny": "small",
    "medium": "medium",
    "moderate": "medium",
    "standard": "medium",
    "large": "large",
    "high": "large",
    "big": "large",
    "heavy": "large",
    "very_large": "very_large",
    "very large": "very_large",
    "critical": "very_large",
    "massive": "very_large",
    "severe": "very_large",
}


def clean_and_parse_json(content: str) -> dict[str, Any]:
    """
    Robustly extract and parse JSON from model output:
    1. Strip <think>...</think> reasoning blocks.
    2. Strip markdown code fences (```json ... ```).
    3. Direct JSON decode with regex fallback for outermost { ... }.
    4. Normalize volume_level synonyms to valid schema literals.
    """
    cleaned = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if match:
            data = json.loads(match.group(1).strip())
        else:
            raise

    if isinstance(data, dict) and "volume_level" in data:
        vol = str(data["volume_level"]).lower().strip()
        data["volume_level"] = VOLUME_LEVEL_MAP.get(vol, data["volume_level"])

    return data


async def analyze_report_with_groq(description: str | None, image_url: str | None) -> AIAnalysisResult | None:
    """
    Calls the Groq API to analyze a waste report.
    Returns a validated AIAnalysisResult, or None if analysis fails.
    """
    settings = get_settings()
    if not settings.groq_api_key:
        logger.error("GROQ_API_KEY is not configured.")
        return None

    # Construct the user message
    user_content: list[dict[str, Any]] = []

    text_prompt = "Analyze this waste report."
    if description:
        text_prompt += f"\nDescription provided by citizen: {description}"
    else:
        text_prompt += "\nNo description provided."

    user_content.append({"type": "text", "text": text_prompt})

    if image_url:
        groq_image_url = image_url
        if image_url.startswith("/media/") or image_url.startswith("media/"):
            import base64
            from pathlib import Path
            clean_rel = image_url.lstrip("/")
            if clean_rel.startswith("media/"):
                clean_rel = clean_rel[len("media/"):]
            local_file = Path(settings.storage_local_dir) / clean_rel
            if local_file.is_file():
                try:
                    f_bytes = local_file.read_bytes()
                    ct = "image/jpeg"
                    if local_file.suffix.lower() == ".png":
                        ct = "image/png"
                    elif local_file.suffix.lower() == ".webp":
                        ct = "image/webp"
                    b64 = base64.b64encode(f_bytes).decode("utf-8")
                    groq_image_url = f"data:{ct};base64,{b64}"
                except Exception as exc:
                    logger.warning("Failed to read local media file for AI analysis: %s", exc)

        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": groq_image_url,
                "detail": "high"
            }
        })

    model_name = settings.groq_model
    payload: dict[str, Any] = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
        "max_tokens": 500,
    }
    # For reasoning models (e.g. Qwen), disable thinking tokens to ensure immediate valid JSON
    if "qwen" in model_name.lower():
        payload["reasoning_effort"] = "none"

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    raw_content = ""
    try:
        async with httpx.AsyncClient(timeout=settings.groq_timeout) as client:
            try:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                # If json_validate_failed (model emitted non-JSON / thinking token), fallback without response_format constraint
                if exc.response.status_code == 400 and "json_validate_failed" in exc.response.text:
                    logger.warning("Groq json_validate_failed; retrying without response_format constraint...")
                    fallback_payload = dict(payload)
                    fallback_payload.pop("response_format", None)
                    fallback_payload.pop("reasoning_effort", None)
                    fallback_payload["max_tokens"] = 800
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        json=fallback_payload,
                        headers=headers,
                    )
                    response.raise_for_status()
                # If media retrieval failed (e.g. 403 or unreachable image host), fallback to text-only analysis
                elif exc.response.status_code == 400 and "failed to retrieve media" in exc.response.text.lower() and image_url:
                    logger.warning("Groq failed to retrieve image media; retrying with text-only prompt...")
                    text_only_content = [c for c in user_content if c.get("type") == "text"]
                    text_payload = dict(payload)
                    text_payload["messages"] = [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": text_only_content}
                    ]
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        json=text_payload,
                        headers=headers,
                    )
                    response.raise_for_status()
                else:
                    raise exc

            data = response.json()
            raw_content = data["choices"][0]["message"]["content"]
            parsed_json = clean_and_parse_json(raw_content)

            # Strict Pydantic validation
            result = AIAnalysisResult.model_validate(parsed_json)
            return result

    except httpx.TimeoutException:
        logger.error("Groq API request timed out.")
        return None
    except httpx.HTTPStatusError as e:
        logger.error("Groq API HTTP error: %s - %s", e.response.status_code, e.response.text)
        return None
    except (json.JSONDecodeError, ValueError) as e:
        logger.error("Failed to decode JSON from Groq response: %s (raw: %s)", e, raw_content)
        return None
    except ValidationError as e:
        logger.error("Groq response failed schema validation: %s", e.errors())
        return None
    except Exception as e:
        logger.exception("Unexpected error during Groq analysis: %s", str(e))
        return None
