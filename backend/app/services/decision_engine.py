from app.schemas.ai import AIAnalysisResult

def generate_recommendations(ai_result: AIAnalysisResult) -> dict[str, str]:
    """
    Deterministic business logic to recommend team, vehicle, and action
    based on the AI analysis of a waste report.
    
    Returns a dictionary with:
    - recommended_team
    - recommended_vehicle
    - recommended_action
    """
    team = "General Maintenance"
    vehicle = "Light Pickup"
    action = ai_result.recommended_action
    
    weight = ai_result.estimated_weight_kg
    vol = ai_result.volume_level
    
    if ai_result.is_hazardous:
        team = "Hazardous Response Team"
        vehicle = "Hazmat Truck"
        if not action:
            action = "Dispatch hazmat crew. Follow strict safety protocols."
    elif ai_result.is_recyclable:
        team = "Recycling Team"
        vehicle = "Recycling Truck"
        if not action:
            action = "Sort and transport to recycling facility."
    elif vol == "very_large" or weight >= 500:
        team = "Heavy Cleanup Crew"
        vehicle = "Dump Truck"
        if not action:
            action = "Requires heavy machinery for safe removal."
    elif vol == "large" or weight >= 100:
        team = "Standard Cleanup Crew"
        vehicle = "Standard Garbage Truck"
        if not action:
            action = "Standard route pickup."
    else:
        if not action:
            action = "Routine clearing."
            
    return {
        "recommended_team": team,
        "recommended_vehicle": vehicle,
        "recommended_action": action,
    }
