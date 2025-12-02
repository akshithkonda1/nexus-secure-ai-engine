from typing import List
from ..models.workspace import ContentModel


def get_pages(user_id: str) -> List[ContentModel]:
    return [
        ContentModel(id="page-1", user_id=user_id, content="Long-form page", type="page", links=["note-1"]),
        ContentModel(id="note-1", user_id=user_id, content="Quick scratch", type="note", links=[]),
    ]
