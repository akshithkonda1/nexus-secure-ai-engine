"""Task and calendar management for the workspace backend."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Dict, List, Optional
import uuid


@dataclass
class Task:
    id: str
    title: str
    description: str = ""
    due_date: Optional[date] = None
    completed: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.utcnow())


@dataclass
class CalendarEvent:
    id: str
    task_id: str
    event_date: date


class TaskCalendarBackend:
    """Provides minimal CRUD operations for tasks and calendar events."""

    def __init__(self) -> None:
        self._tasks: Dict[str, Task] = {}
        self._events_by_date: Dict[date, List[CalendarEvent]] = {}

    def create_task(self, title: str, description: str = "", due_date: Optional[date] = None) -> Task:
        task_id = str(uuid.uuid4())
        task = Task(id=task_id, title=title, description=description, due_date=due_date)
        self._tasks[task_id] = task
        if due_date:
            self.add_event(task_id, due_date)
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def list_tasks(self) -> List[Task]:
        return list(self._tasks.values())

    def update_task(self, task_id: str, **updates) -> Optional[Task]:
        task = self._tasks.get(task_id)
        if not task:
            return None
        for key, value in updates.items():
            if hasattr(task, key):
                setattr(task, key, value)
        return task

    def delete_task(self, task_id: str) -> bool:
        task = self._tasks.pop(task_id, None)
        if not task:
            return False
        # remove related events
        for events in self._events_by_date.values():
            events[:] = [event for event in events if event.task_id != task_id]
        return True

    def add_event(self, task_id: str, event_date: date) -> CalendarEvent:
        if task_id not in self._tasks:
            raise KeyError("Task does not exist for event creation")
        event = CalendarEvent(id=str(uuid.uuid4()), task_id=task_id, event_date=event_date)
        self._events_by_date.setdefault(event_date, []).append(event)
        return event

    def events_on(self, event_date: date) -> List[CalendarEvent]:
        return list(self._events_by_date.get(event_date, []))

    def calendar(self) -> Dict[date, List[CalendarEvent]]:
        return {day: list(events) for day, events in self._events_by_date.items()}
