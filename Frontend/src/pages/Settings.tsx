import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  CheckCircle2,
  ClipboardList,
  Database,
  GripVertical,
  LayoutGrid,
  Link2,
  Loader2,
  Lock,
  Plus,
  RefreshCcw,
  Save,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Terminal,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { Switch } from "@/shared/ui/components/switch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";

/* -------------------------------------------------------------------------- */
/* Types – we extend SettingsData with the new sections                       */
/* -------------------------------------------------------------------------- */

type ZoraEnginePref = {
  id: string;
  name: string;
  enabled: boolean;
  rank: number;
};

type ZoraSettingsSection = {
  enginePreferences: ZoraEnginePref[];
  defaultMode: "balanced" | "deep" | "fast";
  multiModelDebate: boolean;
  autoWebVerify: boolean;
  saveDebatesToWorkspace: boolean;
  showAdvancedDebugPanel: boolean;
  safeModeOnHighRisk: boolean;
  maxContextTokens: number;
};

type WorkspaceConnector = {
  id: string;
  name: string;
  category: string;
  connected: boolean;
};

type WorkspaceSettingsSection = {
  connectors: WorkspaceConnector[];
  autoOrganize: boolean;
  studyMode: boolean;
  allowWriteBack: boolean;
  dailyDigest: boolean;
  defaultView: "timeline" | "grid" | "list";
  maxActiveWorkspaces: number;
};

type CommandCenterWidgetPref = {
  id: string;
  name: string;
  enabled: boolean;
  rank: number;
  description: string;
};

type CommandCenterSettingsSection = {
  widgets: CommandCenterWidgetPref[];
  openOnLaunch: boolean;
  showHotkeysOverlay: boolean;
  syncWorkspaceTasks: boolean;
  keepCommandHistory: boolean;
  showExperimentalWidgets: boolean;
  defaultLayout: "compact" | "wide";
};

type PrivacySources = {
  includePrompts: boolean;
  includeOutputs: boolean;
  includeFileNames: boolean;
  includeErrorTraces: boolean;
};

type PrivacySettingsSection = {
  telemetryEnabled: boolean;
  telemetryConsentVersion: string | null;
  telemetryLastAnsweredAt: string | null;
  shareWithModelProviders: boolean;
  sources: PrivacySources;
  retentionDays: number;
  idleLockEnabled: boolean;
  idleLockMinutes: number;
  requireTwoFactor: boolean;
};

type ExtendedSettingsData = SettingsData & {
  zora?: ZoraSettingsSection;
  workspaceSettings?: WorkspaceSettingsSection;
  commandCenter?: CommandCenterSettingsSection;
  privacy?: PrivacySettingsSection;
};

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_ZORA_ENGINES: ZoraEnginePref[] = [
  { id: "openai-gpt-4o", name: "OpenAI GPT-4o", enabled: true, rank: 1 },
  {
    id: "anthropic-claude-3-5-sonnet",
    name: "Anthropic Claude 3.5 Sonnet",
    enabled: true,
    rank: 2,
  },
  { id: "mistral-large", name: "Mistral Large", enabled: true, rank: 3 },
  {
    id: "meta-llama-3-1-405b",
    name: "Meta Llama 3.1 405B",
    enabled: true,
    rank: 4,
  },
  {
    id: "cohere-command-r-plus",
    name: "Cohere Command R+",
    enabled: true,
    rank: 5,
  },
  {
    id: "amazon-titan-text-premier",
    name: "Amazon Titan Text Premier",
    enabled: true,
    rank: 6,
  },
  { id: "grok-3", name: "Grok 3", enabled: true, rank: 7 },
  { id: "qwen-2-5-72b", name: "Qwen 2.5 72B", enabled: true, rank: 8 },
  { id: "gemini-1-5-pro", name: "Gemini 1.5 Pro", enabled: false, rank: 9 },
  { id: "dbrx", name: "Databricks DBRX", enabled: false, rank: 10 },
];

const DEFAULT_ZORA_SETTINGS: ZoraSettingsSection = {
  enginePreferences: DEFAULT_ZORA_ENGINES,
  defaultMode: "balanced",
  multiModelDebate: true,
  autoWebVerify: true,
  saveDebatesToWorkspace: true,
  showAdvancedDebugPanel: false,
  safeModeOnHighRisk: true,
  maxContextTokens: 16000,
};

const DEFAULT_WORKSPACE_CONNECTORS: WorkspaceConnector[] = [
  { id: "google-drive", name: "Google Drive", category: "Storage", connected: true },
  { id: "onedrive", name: "OneDrive", category: "Storage", connected: true },
  { id: "notion", name: "Notion", category: "Notes", connected: false },
  { id: "github", name: "GitHub", category: "Code", connected: false },
  { id: "canvas", name: "Canvas LMS", category: "Learning", connected: false },
];

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettingsSection = {
  connectors: DEFAULT_WORKSPACE_CONNECTORS,
  autoOrganize: true,
  studyMode: true,
  allowWriteBack: false,
  dailyDigest: false,
  defaultView: "timeline",
  maxActiveWorkspaces: 5,
};

const DEFAULT_COMMAND_CENTER_WIDGETS: CommandCenterWidgetPref[] = [
  {
    id: "projects",
    name: "Projects",
    enabled: true,
    rank: 1,
    description: "Pinned work in motion across Zora.",
  },
  {
    id: "upcoming",
    name: "Upcoming",
    enabled: true,
    rank: 2,
    description: "Next meetings, reviews, and deadlines.",
  },
  {
    id: "research-signals",
    name: "Research signals",
    enabled: true,
    rank: 3,
    description: "Live updates from your connected sources.",
  },
  {
    id: "notifications",
    name: "Notifications",
    enabled: true,
    rank: 4,
    description: "Mentions, comments, and alerts.",
  },
  {
    id: "quick-commands",
    name: "Quick commands",
    enabled: true,
    rank: 5,
    description: "Recent prompts and saved command snippets.",
  },
];

const DEFAULT_COMMAND_CENTER_SETTINGS: CommandCenterSettingsSection = {
  widgets: DEFAULT_COMMAND_CENTER_WIDGETS,
  openOnLaunch: false,
  showHotkeysOverlay: true,
  syncWorkspaceTasks: true,
  keepCommandHistory: true,
  showExperimentalWidgets: false,
  defaultLayout: "compact",
};

const DEFAULT_PRIVACY_SETTINGS: PrivacySettingsSection = {
  telemetryEnabled: false,
  telemetryConsentVersion: null,
  telemetryLastAnsweredAt: null,
  shareWithModelProviders: false,
  sources: {
    includePrompts: true,
    includeOutputs: true,
    includeFileNames: false,
    includeErrorTraces: false,
  },
  retentionDays: 90,
  idleLockEnabled: false,
  idleLockMinutes: 20,
  requireTwoFactor: false,
};

/* -------------------------------------------------------------------------- */

type SettingsTab = "zora" | "workspace" | "command-center" | "privacy";

/* -------------------------------------------------------------------------- */

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>("zora");
  const [showTelemetryConsent, setShowTelemetryConsent] = useState(false);

  // We don't actually need the pending value separately yet, but keeping hook
  // if we later want to support "ask again" flows.
  const [pendingTelemetryEnable] = useState<boolean | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Loading / error states                                                 */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="px-[var(--page-padding)] py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="panel panel--glassy panel--hover panel--immersive panel--alive"
            >
              <SkeletonBlock />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-[var(--page-padding)] py-6">
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-6 text-center text-sm text-[rgba(var(--subtle),0.85)]">
          <p>Settings are currently unavailable.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 btn btn-ghost btn-neo btn-quiet text-brand"
          >
            <RefreshCcw className="size-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const settings = data as ExtendedSettingsData;

  const zora = settings.zora ?? DEFAULT_ZORA_SETTINGS;
  const workspace = settings.workspaceSettings ?? DEFAULT_WORKSPACE_SETTINGS;
  const commandCenter =
    settings.commandCenter ?? DEFAULT_COMMAND_CENTER_SETTINGS;
  const privacy = settings.privacy ?? DEFAULT_PRIVACY_SETTINGS;

  const rankedEngines = [...zora.enginePreferences].sort(
    (a, b) => a.rank - b.rank,
  );
  const rankedWidgets = [...commandCenter.widgets].sort(
    (a, b) => a.rank - b.rank,
  );

  /* ---------------------------------------------------------------------- */
  /* Update helper                                                          */
  /* ---------------------------------------------------------------------- */

  const updateSettings = (
    update: Partial<ExtendedSettingsData>,
    successMessage: string,
  ) => {
    const next: ExtendedSettingsData = {
      ...settings,
      ...update,
    };

    return saveSettings
      .mutateAsync(next as SettingsData)
      .then(() => toast.success(successMessage))
      .catch(() =>
        toast.error("We couldn’t save that change. Please try again."),
      );
  };

  /* ---------------------------------------------------------------------- */
  /* Zora handlers                                                          */
  /* ---------------------------------------------------------------------- */

  const handleZoraEngineToggle = (id: string, enabled: boolean) => {
    const nextEngines = rankedEngines.map((engine) =>
      engine.id === id ? { ...engine, enabled } : engine,
    );
    updateSettings(
      { zora: { ...zora, enginePreferences: nextEngines } },
      "Engine preferences updated.",
    );
  };

  const handleZoraEngineReorder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rankedEngines.length) return;

    const next = [...rankedEngines];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const reRanked = next.map((engine, idx) => ({
      ...engine,
      rank: idx + 1,
    }));

    updateSettings(
      { zora: { ...zora, enginePreferences: reRanked } },
      "Engine order saved.",
    );
  };

  const setZoraMode = (mode: ZoraSettingsSection["defaultMode"]) => {
    updateSettings(
      { zora: { ...zora, defaultMode: mode } },
      "Default mode updated.",
    );
  };

  const setZoraToggle = <K extends keyof ZoraSettingsSection>(
    key: K,
    value: ZoraSettingsSection[K],
  ) => {
    updateSettings(
      { zora: { ...zora, [key]: value } },
      "Zora settings updated.",
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Workspace handlers                                                     */
  /* ---------------------------------------------------------------------- */

  const handleConnectorToggle = (id: string, connected: boolean) => {
    const nextConnectors = workspace.connectors.map((c) =>
      c.id === id ? { ...c, connected } : c,
    );
    updateSettings(
      {
        workspaceSettings: {
          ...workspace,
          connectors: nextConnectors,
        },
      },
      "Workspace connectors updated.",
    );
  };

  const handleAddConnector = () => {
    toast.info(
      "The connector gallery will open here once the backend endpoint is wired.",
    );
  };

  const setWorkspaceToggle = <K extends keyof WorkspaceSettingsSection>(
    key: K,
    value: WorkspaceSettingsSection[K],
  ) => {
    updateSettings(
      {
        workspaceSettings: {
          ...workspace,
          [key]: value,
        },
      },
      "Workspace settings updated.",
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Command Center handlers                                                */
  /* ---------------------------------------------------------------------- */

  const handleWidgetToggle = (id: string, enabled: boolean) => {
    const nextWidgets = rankedWidgets.map((w) =>
      w.id === id ? { ...w, enabled } : w,
    );
    updateSettings(
      {
        commandCenter: {
          ...commandCenter,
          widgets: nextWidgets,
        },
      },
      "Command Center widgets updated.",
    );
  };

  const handleWidgetReorder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rankedWidgets.length) return;

    const next = [...rankedWidgets];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const reRanked = next.map((widget, idx) => ({
      ...widget,
      rank: idx + 1,
    }));

    updateSettings(
      {
        commandCenter: {
          ...commandCenter,
          widgets: reRanked,
        },
      },
      "Command Center layout saved.",
    );
  };

  const setCommandCenterToggle = <
    K extends keyof CommandCenterSettingsSection,
  >(
    key: K,
    value: CommandCenterSettingsSection[K],
  ) => {
    updateSettings(
      { commandCenter: { ...commandCenter, [key]: value } },
      "Command Center settings updated.",
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Privacy & Security handlers                                            */
  /* ---------------------------------------------------------------------- */

  const handleTelemetryToggle = (enabled: boolean) => {
    if (!enabled) {
      const nextPrivacy: PrivacySettingsSection = {
        ...privacy,
        telemetryEnabled: false,
      };
      updateSettings(
        { privacy: nextPrivacy },
        "Telemetry disabled. Zora will stop sending usage signals.",
      );
      return;
    }

    // User is trying to turn telemetry ON – show consent sheet.
    setShowTelemetryConsent(true);
  };

  const acceptTelemetryConsent = () => {
    const now = new Date().toISOString();
    const nextPrivacy: PrivacySettingsSection = {
      ...privacy,
      telemetryEnabled: true,
      telemetryConsentVersion: "v1",
      telemetryLastAnsweredAt: now,
    };
    updateSettings(
      { privacy: nextPrivacy },
      "Telemetry enabled. Thanks for helping improve Zora.",
    );
    setShowTelemetryConsent(false);
  };

  const cancelTelemetryConsent = () => {
    setShowTelemetryConsent(false);
  };

  const setPrivacySourceToggle = <K extends keyof PrivacySources>(
    key: K,
    value: PrivacySources[K],
  ) => {
    const nextPrivacy: PrivacySettingsSection = {
      ...privacy,
      sources: {
        ...privacy.sources,
        [key]: value,
      },
    };
    updateSettings(
      { privacy: nextPrivacy },
      "Telemetry sources updated.",
    );
  };

  const setPrivacyToggle = <K extends keyof PrivacySettingsSection>(
    key: K,
    value: PrivacySettingsSection[K],
  ) => {
    const nextPrivacy: PrivacySettingsSection = {
      ...privacy,
      [key]: value,
    };
    updateSettings(
      { privacy: nextPrivacy },
      "Privacy settings updated.",
    );
  };

  const handleDownloadData = () => {
    toast.info(
      "Your data export will be prepared once the export endpoint is connected.",
    );
  };

  const handleApplyTheme = () => {
    setTheme(settings.appearance.theme);
    toast.success(`Applied ${settings.appearance.theme} theme for this device.`);
  };

  /* ---------------------------------------------------------------------- */
  /* UI – Header + Tabs                                                     */
  /* ---------------------------------------------------------------------- */

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "zora",
      label: "Zora",
      icon: <Terminal className="size-4" />,
    },
    {
      id: "workspace",
      label: "Workspace",
      icon: <Database className="size-4" />,
    },
    {
      id: "command-center",
      label: "Command Center",
      icon: <LayoutGrid className="size-4" />,
    },
    {
      id: "privacy",
      label: "Privacy & Security",
      icon: <Shield className="size-4" />,
    },
  ];

  return (
    <>
      <div className="px-[var(--page-padding)] py-6">
        {/* Header / tab bar */}
        <section className="panel panel--glassy panel--immersive panel--alive panel--halo rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
                Settings
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[rgb(var(--text))] sm:text-2xl">
                Shape how Zora behaves, remembers, and protects you.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[rgba(var(--subtle),0.8)]">
                Each section keeps related controls together: Zora for engine
                behavior, Workspace for your study & work hub, Command Center
                for orchestration, and Privacy for how data moves.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    activeTab === tab.id
                      ? "border-[rgba(var(--brand),0.7)] bg-[rgba(var(--brand-soft),0.22)] text-brand"
                      : "border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.9)] text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.4)] hover:text-brand"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab bodies */}
        {activeTab === "zora" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {/* Engine ranking */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Zora engine
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    Rank your models
                  </h2>
                  <p className="mt-1 text-sm text-[rgba(var(--subtle),0.8)]">
                    Drag with the grip or nudge with arrows to tell Zora which
                    model to try first. For Analyze and long-form tasks, we’ll
                    walk this list from top to bottom until an engine fits.
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {rankedEngines.map((engine, index) => {
                  const isFirst = index === 0;
                  const isLast = index === rankedEngines.length - 1;

                  return (
                    <li
                      key={engine.id}
                      className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.32)] bg-[rgba(var(--panel),0.6)] px-3 py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] text-[rgba(var(--subtle),0.9)]"
                          aria-label="Reorder engine (drag handle)"
                        >
                          <GripVertical className="size-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-[rgba(var(--panel),0.9)] text-[11px] font-semibold text-[rgba(var(--subtle),0.9)]">
                              {index + 1}
                            </span>
                            <p className="font-semibold text-[rgb(var(--text))]">
                              {engine.name}
                            </p>
                            {isFirst && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.14)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                                <Star className="size-3" /> Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.78)]">
                            {engine.enabled
                              ? isFirst
                                ? "Primary engine for general tasks."
                                : "Used as a fallback when higher engines are busy or restricted."
                              : "Currently disabled for routing."}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleZoraEngineReorder(index, "up")
                            }
                            disabled={isFirst}
                            className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                              isFirst
                                ? "cursor-default border-[rgba(var(--border),0.4)] text-[rgba(var(--subtle),0.6)]"
                                : "border-[rgba(var(--border),0.6)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-brand"
                            }`}
                            aria-label="Move engine up"
                          >
                            <ArrowUp className="mr-1 size-3" />
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleZoraEngineReorder(index, "down")
                            }
                            disabled={isLast}
                            className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                              isLast
                                ? "cursor-default border-[rgba(var(--border),0.4)] text-[rgba(var(--subtle),0.6)]"
                                : "border-[rgba(var(--border),0.6)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-brand"
                            }`}
                            aria-label="Move engine down"
                          >
                            <ArrowDown className="mr-1 size-3" />
                            Down
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
                          <span>{engine.enabled ? "Enabled" : "Disabled"}</span>
                          <Switch
                            checked={engine.enabled}
                            onCheckedChange={(checked) =>
                              handleZoraEngineToggle(engine.id, checked)
                            }
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Zora behavior settings */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Behavior
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    How Zora thinks and responds
                  </h2>
                </div>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[rgba(var(--subtle),0.78)]">
                      Default mode
                    </span>
                  </div>
                  <div className="inline-flex gap-2">
                    {[
                      { id: "balanced", label: "Balanced" },
                      { id: "deep", label: "Deep" },
                      { id: "fast", label: "Fast" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setZoraMode(
                            mode.id as ZoraSettingsSection["defaultMode"],
                          )
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
                          zora.defaultMode === mode.id
                            ? "border-[rgba(var(--brand),0.7)] bg-[rgba(var(--brand-soft),0.22)] text-brand"
                            : "border-[rgba(var(--border),0.5)] bg-[rgba(var(--panel),0.95)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)] hover:text-brand"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.78)]">
                    Balanced is recommended for most users. Deep favors
                    reasoning; Fast favors latency.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Multi-model debate
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Let multiple engines critique each other before Zora
                      answers.
                    </p>
                  </div>
                  <Switch
                    checked={zora.multiModelDebate}
                    onCheckedChange={(checked) =>
                      setZoraToggle("multiModelDebate", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Auto-verify with the web
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      For factual queries, Zora can cross-check answers with
                      trusted sources.
                    </p>
                  </div>
                  <Switch
                    checked={zora.autoWebVerify}
                    onCheckedChange={(checked) =>
                      setZoraToggle("autoWebVerify", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Save debates into Workspace
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Keep transcripts so you can audit how Zora arrived at an
                      answer.
                    </p>
                  </div>
                  <Switch
                    checked={zora.saveDebatesToWorkspace}
                    onCheckedChange={(checked) =>
                      setZoraToggle("saveDebatesToWorkspace", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Safe mode on high-risk queries
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      When prompts look health, legal, or safety-critical, Zora
                      will favor slower but safer engines.
                    </p>
                  </div>
                  <Switch
                    checked={zora.safeModeOnHighRisk}
                    onCheckedChange={(checked) =>
                      setZoraToggle("safeModeOnHighRisk", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Max context per chat
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Higher limits remember more, but can be slower.
                    </p>
                  </div>
                  <select
                    value={zora.maxContextTokens}
                    onChange={(event) =>
                      setZoraToggle("maxContextTokens", Number(event.target.value))
                    }
                    className="rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.96)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.6)] focus:outline-none"
                  >
                    <option value={8000}>8K tokens</option>
                    <option value={16000}>16K tokens</option>
                    <option value={32000}>32K tokens</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Advanced debug panel
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Show routing decisions, engine scores, and internal
                      metadata in a side drawer.
                    </p>
                  </div>
                  <Switch
                    checked={zora.showAdvancedDebugPanel}
                    onCheckedChange={(checked) =>
                      setZoraToggle("showAdvancedDebugPanel", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "workspace" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Connectors */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-brand" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                      Workspace
                    </p>
                    <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                      Connectors & sources
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddConnector}
                  className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--brand),0.65)] bg-[rgba(var(--brand-soft),0.2)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand"
                >
                  <Plus className="size-3" />
                  Add connector
                </button>
              </div>
              <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
                Turn connections on or off without breaking your notes. Zora
                pulls data in read-only mode unless you explicitly allow
                write-back.
              </p>

              <ul className="mt-4 space-y-3 text-sm">
                {workspace.connectors.map((connector) => (
                  <li
                    key={connector.id}
                    className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.6)] px-3 py-3"
                  >
                    <div>
                      <p className="font-semibold text-[rgb(var(--text))]">
                        {connector.name}
                      </p>
                      <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                        {connector.category} •{" "}
                        {connector.connected ? "Connected" : "Not connected"}
                      </p>
                    </div>
                    <Switch
                      checked={connector.connected}
                      onCheckedChange={(checked) =>
                        handleConnectorToggle(connector.id, checked)
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Workspace behaviors */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <Database className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Workflow
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    How Workspace organizes things
                  </h2>
                </div>
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Auto-organize sessions
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Group sessions into projects and topics automatically.
                    </p>
                  </div>
                  <Switch
                    checked={workspace.autoOrganize}
                    onCheckedChange={(checked) =>
                      setWorkspaceToggle("autoOrganize", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Study mode
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Turn long notes into flashcards and quick drills.
                    </p>
                  </div>
                  <Switch
                    checked={workspace.studyMode}
                    onCheckedChange={(checked) =>
                      setWorkspaceToggle("studyMode", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Allow write-back to connectors
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      When enabled, Zora can push cleaned-up notes and summaries
                      back into tools like Notion or Drive.
                    </p>
                  </div>
                  <Switch
                    checked={workspace.allowWriteBack}
                    onCheckedChange={(checked) =>
                      setWorkspaceToggle("allowWriteBack", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Daily Workspace digest
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Receive a quick summary of what changed in Workspace.
                    </p>
                  </div>
                  <Switch
                    checked={workspace.dailyDigest}
                    onCheckedChange={(checked) =>
                      setWorkspaceToggle("dailyDigest", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Default view
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Choose how Workspace opens by default.
                    </p>
                  </div>
                  <select
                    value={workspace.defaultView}
                    onChange={(event) =>
                      setWorkspaceToggle(
                        "defaultView",
                        event.target.value as WorkspaceSettingsSection["defaultView"],
                      )
                    }
                    className="rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.96)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.6)] focus:outline-none"
                  >
                    <option value="timeline">Timeline</option>
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5 text-[11px] text-[rgba(var(--subtle),0.85)]">
                  <p className="font-semibold text-[rgb(var(--text))]">
                    Max active workspaces
                  </p>
                  <p className="mt-1">
                    {workspace.maxActiveWorkspaces} workspaces can stay “hot”
                    for fast switching. Older ones are archived, not deleted.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "command-center" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Widget layout */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <LayoutGrid className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Command Center
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    Layout & widgets
                  </h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
                Decide what shows up in Command Center and in which order.
                Projects always live here; everything else is up to you.
              </p>

              <ul className="mt-4 space-y-3 text-sm">
                {rankedWidgets.map((widget, index) => {
                  const isFirst = index === 0;
                  const isLast = index === rankedWidgets.length - 1;

                  return (
                    <li
                      key={widget.id}
                      className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.6)] px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] text-[rgba(var(--subtle),0.9)]"
                          aria-label="Reorder widget (drag handle)"
                        >
                          <GripVertical className="size-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-[rgba(var(--panel),0.9)] text-[11px] font-semibold text-[rgba(var(--subtle),0.9)]">
                              {index + 1}
                            </span>
                            <p className="font-semibold text-[rgb(var(--text))]">
                              {widget.name}
                            </p>
                            {widget.id === "projects" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.14)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                                Pinned
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
                            {widget.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleWidgetReorder(index, "up")
                            }
                            disabled={isFirst}
                            className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                              isFirst
                                ? "cursor-default border-[rgba(var(--border),0.4)] text-[rgba(var(--subtle),0.6)]"
                                : "border-[rgba(var(--border),0.6)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-brand"
                            }`}
                          >
                            <ArrowUp className="mr-1 size-3" />
                            Up
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleWidgetReorder(index, "down")
                            }
                            disabled={isLast}
                            className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                              isLast
                                ? "cursor-default border-[rgba(var(--border),0.4)] text-[rgba(var(--subtle),0.6)]"
                                : "border-[rgba(var(--border),0.6)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-brand"
                            }`}
                          >
                            <ArrowDown className="mr-1 size-3" />
                            Down
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
                          <span>{widget.enabled ? "Visible" : "Hidden"}</span>
                          <Switch
                            checked={widget.enabled}
                            onCheckedChange={(checked) =>
                              handleWidgetToggle(widget.id, checked)
                            }
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Command Center behavior */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <Wifi className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Behavior
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    How Command Center behaves
                  </h2>
                </div>
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Open Command Center at launch
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Start every session from your projects and upcoming work.
                    </p>
                  </div>
                  <Switch
                    checked={commandCenter.openOnLaunch}
                    onCheckedChange={(checked) =>
                      setCommandCenterToggle("openOnLaunch", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Hotkey overlay
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Show keyboard hints when Command Center is open.
                    </p>
                  </div>
                  <Switch
                    checked={commandCenter.showHotkeysOverlay}
                    onCheckedChange={(checked) =>
                      setCommandCenterToggle("showHotkeysOverlay", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Sync tasks with Workspace
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Show Workspace tasks and deadlines in Upcoming.
                    </p>
                  </div>
                  <Switch
                    checked={commandCenter.syncWorkspaceTasks}
                    onCheckedChange={(checked) =>
                      setCommandCenterToggle("syncWorkspaceTasks", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Keep command history
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Remember your recent commands for quick reuse.
                    </p>
                  </div>
                  <Switch
                    checked={commandCenter.keepCommandHistory}
                    onCheckedChange={(checked) =>
                      setCommandCenterToggle("keepCommandHistory", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Experimental widgets
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Show early-stage widgets that may change or break.
                    </p>
                  </div>
                  <Switch
                    checked={commandCenter.showExperimentalWidgets}
                    onCheckedChange={(checked) =>
                      setCommandCenterToggle("showExperimentalWidgets", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Layout
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Compact squeezes more widgets into view; Wide gives each
                      more breathing room.
                    </p>
                  </div>
                  <select
                    value={commandCenter.defaultLayout}
                    onChange={(event) =>
                      setCommandCenterToggle(
                        "defaultLayout",
                        event.target.value as CommandCenterSettingsSection["defaultLayout"],
                      )
                    }
                    className="rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.96)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.6)] focus:outline-none"
                  >
                    <option value="compact">Compact</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "privacy" && (
          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {/* Telemetry & sources */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Privacy & security
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    Telemetry & data sources
                  </h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
                Zora is private by default. Opt-in telemetry lets you share
                anonymized patterns to improve the engine and, with your
                permission, help model providers reduce hallucinations.
              </p>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-3">
                  <div className="max-w-md">
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Opt-in telemetry
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Share anonymized usage patterns to help Zora get more
                      accurate over time. Turning this on never grants access to
                      your raw documents.
                    </p>
                  </div>
                  <Switch
                    checked={privacy.telemetryEnabled}
                    onCheckedChange={handleTelemetryToggle}
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-3">
                  <div className="max-w-md">
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Share anonymous telemetry with model providers
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      When enabled, Zora can bundle hallucination and API
                      metrics and sell them back to model providers as
                      aggregated insight. No personal identifiers or raw text
                      leave your account.
                    </p>
                  </div>
                  <Switch
                    checked={privacy.shareWithModelProviders}
                    onCheckedChange={(checked) =>
                      setPrivacyToggle("shareWithModelProviders", checked)
                    }
                    disabled={!privacy.telemetryEnabled}
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] p-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="size-4 text-brand" />
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Telemetry sources
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
                    Choose what can be included when telemetry is enabled.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.65)] px-3 py-2 text-[11px]">
                      <span>Prompt patterns (no raw text)</span>
                      <Switch
                        checked={privacy.sources.includePrompts}
                        onCheckedChange={(checked) =>
                          setPrivacySourceToggle("includePrompts", checked)
                        }
                        disabled={!privacy.telemetryEnabled}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.65)] px-3 py-2 text-[11px]">
                      <span>Model responses (summarized)</span>
                      <Switch
                        checked={privacy.sources.includeOutputs}
                        onCheckedChange={(checked) =>
                          setPrivacySourceToggle("includeOutputs", checked)
                        }
                        disabled={!privacy.telemetryEnabled}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.65)] px-3 py-2 text-[11px]">
                      <span>File names only</span>
                      <Switch
                        checked={privacy.sources.includeFileNames}
                        onCheckedChange={(checked) =>
                          setPrivacySourceToggle("includeFileNames", checked)
                        }
                        disabled={!privacy.telemetryEnabled}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.65)] px-3 py-2 text-[11px]">
                      <span>Error traces (stack + status)</span>
                      <Switch
                        checked={privacy.sources.includeErrorTraces}
                        onCheckedChange={(checked) =>
                          setPrivacySourceToggle("includeErrorTraces", checked)
                        }
                        disabled={!privacy.telemetryEnabled}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] p-3 text-[11px] text-[rgba(var(--subtle),0.85)]">
                  <p className="font-semibold text-[rgb(var(--text))]">
                    Telemetry consent
                  </p>
                  <p className="mt-1">
                    {privacy.telemetryConsentVersion
                      ? `You last accepted telemetry terms on ${
                          privacy.telemetryLastAnsweredAt
                            ? new Date(
                                privacy.telemetryLastAnsweredAt,
                              ).toLocaleString()
                            : "an earlier date"
                        } (version ${privacy.telemetryConsentVersion}).`
                      : "You haven’t accepted telemetry terms yet. Turning telemetry on will show a short consent screen first."}
                  </p>
                </div>
              </div>
            </div>

            {/* Retention & security */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive card rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Safeguards
                  </p>
                  <h2 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    Retention, lock, and export
                  </h2>
                </div>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Data retention
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Chats and logs older than this are auto-deleted.
                    </p>
                  </div>
                  <select
                    value={privacy.retentionDays}
                    onChange={(event) =>
                      setPrivacyToggle(
                        "retentionDays",
                        Number(event.target.value),
                      )
                    }
                    className="rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.96)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.6)] focus:outline-none"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Idle lock
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Lock Zora when you step away for a bit.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={privacy.idleLockMinutes}
                      onChange={(event) =>
                        setPrivacyToggle(
                          "idleLockMinutes",
                          Number(event.target.value),
                        )
                      }
                      disabled={!privacy.idleLockEnabled}
                      className="rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.96)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.6)] focus:outline-none"
                    >
                      <option value={5}>5 min</option>
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                    </select>
                    <Switch
                      checked={privacy.idleLockEnabled}
                      onCheckedChange={(checked) =>
                        setPrivacyToggle("idleLockEnabled", checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      Require two-factor authentication
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      Strongly recommended if you store sensitive data here.
                    </p>
                  </div>
                  <Switch
                    checked={privacy.requireTwoFactor}
                    onCheckedChange={(checked) =>
                      setPrivacyToggle("requireTwoFactor", checked)
                    }
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] p-3 text-[11px] text-[rgba(var(--subtle),0.85)]">
                  <p className="font-semibold text-[rgb(var(--text))]">
                    Download your data
                  </p>
                  <p className="mt-1">
                    Export a copy of your chats, notes, and telemetry logs
                    (where applicable). You can also request deletion at any
                    time.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadData}
                    className="mt-3 inline-flex items-center gap-1 rounded-full border border-[rgba(var(--brand),0.65)] bg-[rgba(var(--brand-soft),0.2)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand"
                  >
                    <Save className="size-3" />
                    Request export
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Small identity / theme helper at the bottom */}
        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-brand" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
                    Appearance
                  </p>
                  <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                    Theme
                  </h3>
                </div>
              </div>
              <ShieldCheck className="size-4 text-[rgba(var(--subtle),0.7)]" />
            </div>
            <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
              Your current theme is{" "}
              <span className="font-semibold">
                {settings.appearance.theme}
              </span>
              . Apply it to this device if things look out of sync.
            </p>
            <button
              type="button"
              onClick={handleApplyTheme}
              className="mt-4 btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              <CheckCircle2 className="size-4" /> Apply theme on this device
            </button>
          </div>
        </section>
      </div>

      {/* Telemetry consent sheet */}
      {showTelemetryConsent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
          <div className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.9)] bg-[rgba(var(--surface),0.98)] p-6 text-sm shadow-[var(--shadow-soft)] max-w-lg w-full mx-4">
            <div className="flex items-center gap-2">
              <Radar className="size-5 text-brand" />
              <h2 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
                Help Zora learn from patterns, not from you.
              </h2>
            </div>
            <p className="mt-3 text-[13px] text-[rgba(var(--subtle),0.85)]">
              If you turn on telemetry, Zora will send anonymized usage
              statistics and error patterns. Your raw prompts, files, and
              account details stay encrypted and are never sold.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-[rgba(var(--subtle),0.85)]">
              <li>No raw documents or full chat transcripts leave your account.</li>
              <li>
                We aggregate hallucination rates, latency, and engine behavior to
                improve Zora’s routing.
              </li>
              <li>
                With your separate toggle, we may sell aggregated insights to
                model providers to fund development.
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-[rgba(var(--subtle),0.75)]">
              You can turn telemetry off at any time from{" "}
              <strong>Settings → Privacy &amp; Security</strong>. Turning it off
              stops future collection but does not retroactively delete data
              already sent.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={cancelTelemetryConsent}
                className="btn btn-ghost btn-neo btn-quiet rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.9)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={acceptTelemetryConsent}
                className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                <CheckCircle2 className="size-4" /> Agree &amp; Enable telemetry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings;

// NOTE: Radar icon import is used in the telemetry sheet.
function Radar(props: React.SVGProps<SVGSVGElement>) {
  return <Activity {...props} />;
}
