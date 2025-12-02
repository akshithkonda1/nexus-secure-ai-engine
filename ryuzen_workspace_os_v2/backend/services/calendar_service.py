from datetime import datetime, timedelta
from typing import List
from ..models.workspace import CalendarModel


def get_events(user_id: str) -> List[CalendarModel]:
    now = datetime.utcnow()
    return [
        CalendarModel(
            id="event-1",
            user_id=user_id,
            source="google",
            title="Team sync",
            start=now,
            end=now + timedelta(hours=1),
            all_day=False,
            metadata={"location": "Virtual"},
        )
    ]
