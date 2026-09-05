"""
Cleanup visualization service for SwachhLens.

Deterministically assigns realistic cleanup-result imagery based on
the classified waste category and report identity.
"""

from __future__ import annotations


def get_cleanup_image_for_report(waste_type: str | None, report_id: str | None = None) -> str:
    """
    Deterministically return an after-cleanup image path matching the waste category.
    """
    wt = (waste_type or "").lower()

    if any(k in wt for k in ["construct", "debris", "demolition", "rubble", "brick", "concrete"]):
        return "/images/cleanup/construction_after_01.jpg"

    if any(k in wt for k in ["plastic", "bottle", "packaging"]):
        return "/images/cleanup/plastic_after_01.jpg"

    if any(k in wt for k in ["organic", "food", "wet", "vegetable", "fruit", "kitchen"]):
        return "/images/cleanup/organic_after_01.jpg"

    if any(k in wt for k in ["hazard", "medical", "electronic", "chemical", "e-waste"]):
        return "/images/cleanup/hazardous_after_01.jpg"

    if any(k in wt for k in ["household", "resident", "domestic"]):
        return "/images/cleanup/household_after_01.jpg"

    # Default / mixed waste category
    return "/images/cleanup/mixed_after_01.jpg"
