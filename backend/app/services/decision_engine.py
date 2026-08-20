from app.schemas.ai import AIAnalysisResult

def generate_recommendations(ai_result: AIAnalysisResult) -> dict[str, str]:
    """
    Deterministic business logic to recommend team, vehicle, priority, and
    a natural-language rationalization based on the AI analysis of a waste report.

    Returns a dictionary with:
    - priority
    - recommended_team
    - recommended_vehicle
    - recommended_action
    """
    # 1. PRIORITY MAPPING
    sev = ai_result.severity_score if ai_result.severity_score is not None else 0.0
    if sev < 30.0:
        priority = "low"
    elif sev < 60.0:
        priority = "medium"
    elif sev < 80.0:
        priority = "high"
    else:
        priority = "critical"

    # 2 & 3. DISPATCH PRECEDENCE & TEAM/VEHICLE RULES
    vol = ai_result.volume_level
    weight = ai_result.estimated_weight_kg

    if ai_result.is_hazardous:
        team = "Hazardous Response Team"
        vehicle = "Hazmat Truck"
        reason = "Material flagged as hazardous requiring strict safety protocols."
    elif vol == "very_large" or (weight is not None and weight >= 500):
        team = "Heavy Cleanup Crew"
        vehicle = "Dump Truck"
        reason = "Extreme volume or weight requires heavy machinery for safe removal."
    elif ai_result.is_recyclable:
        team = "Recycling Team"
        vehicle = "Recycling Truck"
        reason = "Waste is fully recyclable and requires specialized sorting."
    elif vol == "large" or (weight is not None and weight >= 100):
        team = "Standard Cleanup Crew"
        vehicle = "Standard Garbage Truck"
        reason = "Substantial size requires standard municipal collection."
    else:
        team = "General Maintenance"
        vehicle = "Light Pickup"
        reason = "Minor volume can be cleared during routine maintenance."

    # 4. RATIONALIZATION FORMAT
    priority_cap = priority.capitalize()

    if ai_result.waste_type:
        # Avoid double capitalizing if it's already uppercase or title case.
        # For simplicity, if it's "medical", it becomes "Medical".
        waste_type_str = ai_result.waste_type[0].upper() + ai_result.waste_type[1:] if len(ai_result.waste_type) > 0 else "Unclassified"
    else:
        waste_type_str = "Unclassified"

    vol_str = vol if vol else "unknown"
    weight_str = f", Weight: ~{weight}kg" if weight is not None else ""

    action = (
        f"[{priority_cap} Priority] {waste_type_str} waste identified "
        f"(Severity: {sev}/100, Volume: {vol_str}{weight_str}). "
        f"{reason} Assigned {team} via {vehicle}."
    )

    return {
        "priority": priority,
        "recommended_team": team,
        "recommended_vehicle": vehicle,
        "recommended_action": action,
    }
