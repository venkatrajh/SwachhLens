from typing import Literal

from pydantic import BaseModel, Field


class AIAnalysisResult(BaseModel):
    """
    Strict validation schema for Grok AI output.
    Any violation of these bounds will be caught before hitting the database.
    """
    waste_type: str = Field(
        ..., 
        description="The primary type of waste detected (e.g., 'household', 'construction', 'organic').",
        max_length=100
    )
    volume_level: Literal["small", "medium", "large", "very_large"] = Field(
        ...,
        description="Estimated volume level."
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0."
    )
    severity_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Severity score from 0 to 100."
    )
    estimated_weight_kg: float = Field(
        ...,
        ge=0.0,
        description="Estimated weight in kg. Must be non-negative."
    )
    is_hazardous: bool = Field(
        ...,
        description="True if the waste appears hazardous."
    )
    is_recyclable: bool = Field(
        ...,
        description="True if the waste appears recyclable."
    )
    recommended_action: str = Field(
        ...,
        description="A brief recommended action for municipal workers."
    )
    explanation: str | None = Field(
        default=None,
        description="Short transparent explanation describing the visual evidence behind the classification."
    )
    suggested_resources: str | None = Field(
        default=None,
        description="Estimated municipal resources and equipment needed."
    )
