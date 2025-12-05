"""
Team model describing roles, inheritance and visibility boundaries.
"""
from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel, Field


class Team(BaseModel):
    id: str
    name: str
    roles: List[str] = Field(default_factory=list)
    inherits_from: List[str] = Field(default_factory=list)
    visibility: str = "org"


class TeamDirectory:
    def __init__(self):
        self.teams: Dict[str, Team] = {}

    def add_team(self, team: Team) -> None:
        self.teams[team.id] = team

    def resolve_roles(self, team_id: str) -> List[str]:
        team = self.teams[team_id]
        roles = set(team.roles)
        for ancestor in team.inherits_from:
            roles.update(self.resolve_roles(ancestor))
        return sorted(roles)

    def visibility_scope(self, team_id: str) -> str:
        return self.teams[team_id].visibility
