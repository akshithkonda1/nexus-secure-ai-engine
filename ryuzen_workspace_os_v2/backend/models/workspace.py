from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel


class ListModel(BaseModel):
    id: str
    user_id: str
    title: str
    type: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TaskModel(BaseModel):
    id: str
    user_id: str
    title: str
    status: str
    list_id: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CalendarModel(BaseModel):
    id: str
    user_id: str
    source: str
    title: str
    start: datetime
    end: datetime
    all_day: bool = False
    metadata: Optional[Dict[str, str]] = None


class ContentModel(BaseModel):
    id: str
    user_id: str
    content: str
    type: str
    links: Optional[List[str]] = None
    toron_metadata: Optional[Dict[str, str]] = None
