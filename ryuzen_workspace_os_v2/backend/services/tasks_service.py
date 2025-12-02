from typing import List
from datetime import datetime, timedelta
from ..models.workspace import TaskModel


def get_tasks(user_id: str) -> List[TaskModel]:
    now = datetime.utcnow()
    return [
        TaskModel(id="task-1", user_id=user_id, title="Draft spec", status="in-progress", due_date=now + timedelta(days=1)),
        TaskModel(id="task-2", user_id=user_id, title="Sync calendar", status="todo", due_date=now + timedelta(days=2)),
    ]
