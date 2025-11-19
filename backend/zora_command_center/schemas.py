from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

TELEMETRY_LEVELS = ("minimal", "standard", "full")
CONNECTOR_TYPES = ("google_drive", "onedrive", "notion", "github", "canvas", "dropbox")
AVAILABLE_MODELS = [
    "zora-pro-1",
    "zora-reasoner-2",
    "zora-lite",
    "zora-vision",
    "zora-research",
    "zora-code",
    "zora-scribe",
    "zora-strategist",
    "zora-oracle",
    "zora-memory"
]


class BehaviourSettings(BaseModel):
    safeMode: bool = True
    explainReasoning: bool = False
    showModelBadges: bool = True
    autoChooseModel: bool = True
    condensedMode: bool = False
    showSystemPrompt: bool = False
    allowAdvancedReasoning: bool = False


class BehaviourSettingsUpdate(BaseModel):
    safeMode: Optional[bool] = None
    explainReasoning: Optional[bool] = None
    showModelBadges: Optional[bool] = None
    autoChooseModel: Optional[bool] = None
    condensedMode: Optional[bool] = None
    showSystemPrompt: Optional[bool] = None
    allowAdvancedReasoning: Optional[bool] = None


class ToronSettings(BaseModel):
    modelRanking: List[str] = Field(default_factory=lambda: AVAILABLE_MODELS[:10])
    customInstructions: str = ""
    behaviours: BehaviourSettings = Field(default_factory=BehaviourSettings)

    @field_validator("modelRanking")
    def validate_ranking(cls, value: List[str]) -> List[str]:
        if len(value) != 10:
            raise ValueError("modelRanking must contain exactly 10 models")
        return value


class ToronSettingsUpdate(BaseModel):
    modelRanking: Optional[List[str]] = None
    customInstructions: Optional[str] = None
    behaviours: Optional[BehaviourSettingsUpdate] = None

    @field_validator("modelRanking")
    def validate_optional_ranking(cls, value: Optional[List[str]]) -> Optional[List[str]]:
        if value is not None and len(value) != 10:
            raise ValueError("modelRanking must contain exactly 10 models")
        return value


class ConnectorEntry(BaseModel):
    id: str
    type: Literal["google_drive", "notion", "github", "canvas", "onedrive", "dropbox"]
    enabled: bool
    lastSyncedAt: Optional[str]


class WorkspaceSettings(BaseModel):
    connectors: List[ConnectorEntry] = Field(default_factory=list)
    studyMode: bool = False
    dataManagement: bool = True
    customInstructions: str = ""
    dailyDigestEnabled: bool = True


class WorkspaceSettingsUpdate(BaseModel):
    connectors: Optional[List[ConnectorEntry]] = None
    studyMode: Optional[bool] = None
    dataManagement: Optional[bool] = None
    customInstructions: Optional[str] = None
    dailyDigestEnabled: Optional[bool] = None


class CommandCenterWidgets(BaseModel):
    projects: bool = True
    upcoming: bool = True
    signals: bool = True
    connectors: bool = True
    timeline: bool = True
    research: bool = False
    digest: bool = True


class CommandCenterBehaviour(BaseModel):
    aggressiveSignals: bool = False
    softSignals: bool = True
    autoRefresh: bool = True
    showAdvancedInsights: bool = False
    autoSurfaceProjects: bool = True
    timelineGrouping: bool = True
    reduceNoise: bool = False


class CommandCenterSettings(BaseModel):
    widgets: CommandCenterWidgets = Field(default_factory=CommandCenterWidgets)
    behaviour: CommandCenterBehaviour = Field(default_factory=CommandCenterBehaviour)


class CommandCenterSettingsUpdate(BaseModel):
    widgets: Optional[CommandCenterWidgets] = None
    behaviour: Optional[CommandCenterBehaviour] = None


class PrivacySecuritySettings(BaseModel):
    telemetryEnabled: bool = False
    telemetryLevel: Literal["minimal", "standard", "full"] = "minimal"
    includeWorkspaceEvents: bool = False
    includeCommandCenterEvents: bool = False
    includeEngineEvents: bool = False
    safeSearch: bool = True
    dataRetentionDays: int = 30


class PrivacySecuritySettingsUpdate(BaseModel):
    telemetryEnabled: Optional[bool] = None
    telemetryLevel: Optional[Literal["minimal", "standard", "full"]] = None
    includeWorkspaceEvents: Optional[bool] = None
    includeCommandCenterEvents: Optional[bool] = None
    includeEngineEvents: Optional[bool] = None
    safeSearch: Optional[bool] = None
    dataRetentionDays: Optional[int] = None


class UserSettingsDocument(BaseModel):
    userId: str
    zora: ToronSettings = Field(default_factory=ToronSettings)
    workspace: WorkspaceSettings = Field(default_factory=WorkspaceSettings)
    commandCenter: CommandCenterSettings = Field(default_factory=CommandCenterSettings)
    privacySecurity: PrivacySecuritySettings = Field(default_factory=PrivacySecuritySettings)


class UserSettingsUpdate(BaseModel):
    zora: Optional[ToronSettingsUpdate] = None
    workspace: Optional[WorkspaceSettingsUpdate] = None
    commandCenter: Optional[CommandCenterSettingsUpdate] = None
    privacySecurity: Optional[PrivacySecuritySettingsUpdate] = None


class ConnectorCreateRequest(BaseModel):
    id: str
    type: Literal["google_drive", "onedrive", "notion", "github", "canvas", "dropbox"]
    accessToken: str
    refreshToken: Optional[str] = None


class ConnectorToggleResponse(BaseModel):
    id: str
    enabled: bool
    lastSyncedAt: Optional[str]


class DigestResponse(BaseModel):
    id: int
    summary: str
    createdAt: datetime


class TelemetryEvent(BaseModel):
    eventType: str
    payload: Dict[str, Any]


class EngineRequest(BaseModel):
    taskType: str
    payload: Dict[str, Any]


class EngineResponse(BaseModel):
    model: str
    taskType: str
    behaviours: Dict[str, Any]
    output: Dict[str, Any]


class ModelRankingRequest(BaseModel):
    modelRanking: List[str]

    @field_validator("modelRanking")
    def validate_model_list(cls, value: List[str]) -> List[str]:
        if len(value) != 10:
            raise ValueError("modelRanking must contain exactly 10 models")
        return value


class AvailableModel(BaseModel):
    id: str
    status: Literal["available", "maintenance"]
    latencyMs: int
