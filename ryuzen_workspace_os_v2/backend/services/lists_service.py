from typing import List
from ..models.workspace import ListModel


def get_lists(user_id: str) -> List[ListModel]:
    return [
        ListModel(id="list-1", user_id=user_id, title="Weekly plan", type="intentions"),
        ListModel(id="list-2", user_id=user_id, title="Outcomes", type="intentions"),
    ]
