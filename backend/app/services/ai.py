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
        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": image_url,
                "detail": "high"
            }
        })

    payload = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
    }

    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.groq_timeout) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            
            data = response.json()
            raw_content = data["choices"][0]["message"]["content"]
            
            # Clean up markdown code blocks if the model ignored instructions
            raw_content = raw_content.strip()
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:]
            elif raw_content.startswith("```"):
                raw_content = raw_content[3:]
            if raw_content.endswith("```"):
                raw_content = raw_content[:-3]
                
            parsed_json = json.loads(raw_content.strip())
            
            # Strict Pydantic validation
            result = AIAnalysisResult.model_validate(parsed_json)
            return result

    except httpx.TimeoutException:
        logger.error("Groq API request timed out.")
        return None
    except httpx.HTTPStatusError as e:
        logger.error("Groq API HTTP error: %s - %s", e.response.status_code, e.response.text)
        return None
    except json.JSONDecodeError:
        logger.error("Failed to decode JSON from Groq response: %s", raw_content)
        return None
    except ValidationError as e:
        logger.error("Groq response failed schema validation: %s", e.errors())
        return None
    except Exception as e:
        logger.exception("Unexpected error during Groq analysis: %s", str(e))
        return None
