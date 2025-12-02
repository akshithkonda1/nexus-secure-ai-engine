from typing import List, Dict, Any


def analyze_workspace(user_id: str) -> Dict[str, Any]:
    return {
        "user_id": user_id,
        "insights": [
            {"title": "Temporal reasoning", "description": "Schedule synthesized."},
            {"title": "Priority mapping", "description": "Intentions linked to tasks."},
        ],
    }


def get_insights(user_id: str) -> List[Dict[str, str]]:
    return [
        {"title": "Flow analysis", "description": "Boards and flows reviewed."},
        {"title": "System diagnosis", "description": "Connectors healthy."},
    ]
