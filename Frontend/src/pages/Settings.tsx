import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Globe2,
  Loader2,
  Lock,
  PlugZap,
  RefreshCcw,
  Save,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { Switch } from "@/shared/ui/components/switch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";
import { requestDocumentsView } from "@/lib/actions";

type TabId = "zora" | "workspace" | "commandCenter" | "privacy";

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: "zora",
    label: "Zora",
    description: "How the AI thinks, responds, and which engines it prefers.",
  },
  {
    id: "workspace",
    label: "Workspace",
    description: "Docs, study tools, connectors, and daily digests.",
  },
  {
    id: "commandCenter",
    label: "Command Center",
    description: "Projects, widgets, and layout behavior.",
  },
  {
    id: "privacy",
    label: "Privacy & security",
    description: "Telemetry, safe search, and data sources.",
  },
];

const ENGINE_OPTIONS = [
  {
    id: "gpt-4o",
    label: "OpenAI GPT-4o",
    description: "Balanced reasoning, creativity, and speed.",
  },
  {
    id: "gpt-4.1-mini",
    label: "OpenAI GPT-4.1 mini",
    description: "Fast and efficient for everyday prompts.",
  },
  {
    id: "claude-3.5-sonnet",
    label: "Anthropic Claude 3.5 Sonnet",
    description: "Great for deep analysis and longform content.",
  },
  {
    id: "claude-3-haiku",
    label: "Anthropic Claude 3 Haiku",
    description: "Lightweight and snappy for quick tasks.",
  },
  {
    id: "mistral-large",
    label: "Mistral Large",
    description: "Strong multilingual reasoning and code.",
  },
  {
    id: "grok-2",
    label: "xAI Grok-2",
    description: "Web-aware, spicy, and exploratory.",
  },
  {
    id: "qwen-2.5",
    label: "Qwen 2.5",
    description: "Open model tuned for dev and data workflows.",
  },
  {
    id: "bedrock-claude",
    label: "Bedrock · Claude",
    description: "Enterprise Anthropic via AWS Bedrock.",
  },
  {
    id: "bedrock-llama",
    label: "Bedrock · Llama",
    description: "Meta Llama models served through Bedrock.",
  },
  {
    id: "bedrock-titan",
    label: "Bedrock · Titan",
    description: "First-party AWS Titan models for internal use.",
  },
] as const;

const DEFAULT_WIDGETS = [
  {
    id: "projects",
    label: "Projects",
    description: "Pinned, active work across Zora.",
  },
  {
    id: "upcoming",
    label: "Upcoming",
    description: "Next sessions and important dates.",
  },
  {
    id: "signals",
    label: "Research signals",
    description: "Saved links, feeds, and monitoring.",
  },
  {
    id: "inbox",
    label: "Workspace inbox",
    description: "New docs, uploads, and chat sessions.",
  },
];

const DEFAULT_CONNECTORS = [
  {
    id: "google-drive",
    label: "Google Drive",
    description: "Docs, Sheets, Slides, and more.",
  },
  {
    id: "dropbox",
    label: "Dropbox",
    description: "Shared folders and archived files.",
  },
  {
    id: "onedrive",
    label: "OneDrive",
    description: "Microsoft 365 files and class material.",
  },
  {
    id: "github",
    label: "GitHub",
    description: "Repositories, issues, and PR discussions.",
  },
  {
    id: "canvas",
    label: "Canvas LMS",
    description: "Courses, assignments, and announcements.",
  },
  {
    id: "notion",
    label: "Notion",
    description: "Wikis, docs, and project databases.",
  },
];

const DEFAULT_SOURCES = ["Workspace", "Command Center", "Web search", "Connectors"];

function createPayload(settings: SettingsData, overrides: any): SettingsData {
  return {
    ...(settings as any),
    ...(overrides as any),
  } as SettingsData;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const copy = [...items];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

function getEngineMeta(id: string) {
  return ENGINE_OPTIONS.find((e) => e.id === id) ?? {
    id,
    label: id,
    description: "",
  };
}

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  const [activeTab, setActiveTab] = useState<TabId>("zora");

  // --- Zora state -----------------------------------------------------------

  const [engineOrder, setEngineOrder] = useState<string[]>(
    () => ENGINE_OPTIONS.map((e) => e.id),
  );
  const [zoraCustomInstructions, setZoraCustomInstructions] = useState("");
  const [zoraSafeMode, setZoraSafeMode] = useState(true);
  const [zoraAutoEngine, setZoraAutoEngine] = useState(true);
  const [zoraExplainReasoning, setZoraExplainReasoning] = useState(true);
  const [zoraShowBadges, setZoraShowBadges] = useState(true);
  const [zoraDefaultTone, setZoraDefaultTone] =
    useState<"balanced" | "precise" | "creative">("balanced");
  const [zoraShowSystemPrompts, setZoraShowSystemPrompts] = useState(false);

  // --- Workspace state ------------------------------------------------------

  const [workspaceCustomInstructions, setWorkspaceCustomInstructions] =
    useState("");
  const [workspaceDataMode, setWorkspaceDataMode] =
    useState<"compact" | "balanced" | "rich">("balanced");
  const [workspaceStudyMode, setWorkspaceStudyMode] = useState(false);
  const [workspaceDigestEnabled, setWorkspaceDigestEnabled] = useState(false);
  const [workspaceAutoOrganize, setWorkspaceAutoOrganize] = useState(true);
  const [workspaceSuggestFlashcards, setWorkspaceSuggestFlashcards] =
    useState(true);
  const [workspacePinImportant, setWorkspacePinImportant] = useState(true);
  const [workspaceConnectors, setWorkspaceConnectors] = useState(
    DEFAULT_CONNECTORS.map((c) => ({ ...c, enabled: true })),
  );

  // --- Command Center state -------------------------------------------------

  const [commandWidgets, setCommandWidgets] = useState(
    DEFAULT_WIDGETS.map((w) => ({ ...w, enabled: true })),
  );
  const [commandOpenOnLaunch, setCommandOpenOnLaunch] = useState(false);
  const [commandCompactMode, setCommandCompactMode] = useState(false);
  const [commandRememberLayout, setCommandRememberLayout] = useState(true);
  const [commandGlowIntensity, setCommandGlowIntensity] =
    useState<"soft" | "normal" | "strong">("normal");
  const [commandKeyboardShortcut, setCommandKeyboardShortcut] = useState(
    "Ctrl + Shift + K",
  );
  const [commandShowHints, setCommandShowHints] = useState(true);

  // --- Privacy & security state --------------------------------------------

  const [privacyTelemetryOptIn, setPrivacyTelemetryOptIn] = useState(false);
  const [privacyShareAnonStats, setPrivacyShareAnonStats] = useState(false);
  const [privacyAllowModelTraining, setPrivacyAllowModelTraining] =
    useState(false);
  const [privacyStrictSafeSearch, setPrivacyStrictSafeSearch] = useState(true);
  const [privacyAllowExternalWeb, setPrivacyAllowExternalWeb] =
    useState(true);
  const [privacyAllowCommandSources, setPrivacyAllowCommandSources] =
    useState(true);
  const [privacyAllowedSources, setPrivacyAllowedSources] =
    useState<string[]>(DEFAULT_SOURCES);

  const [showTelemetryConsent, setShowTelemetryConsent] = useState(false);
  const [pendingTelemetryValue, setPendingTelemetryValue] =
    useState<boolean | null>(null);

  // --- Hydrate state from backend once -------------------------------------

  useEffect(() => {
    if (!data) return;

    const anySettings = data as any;

    // Zora
    const zora = anySettings.zora ?? {};
    setEngineOrder(
      Array.isArray(zora.engineOrder) && zora.engineOrder.length
        ? zora.engineOrder
        : ENGINE_OPTIONS.map((e: any) => e.id),
    );
    setZoraCustomInstructions(zora.customInstructions ?? "");
    setZoraSafeMode(zora.safeMode ?? true);
    setZoraAutoEngine(zora.autoChooseEngine ?? true);
    setZoraExplainReasoning(zora.explainReasoning ?? true);
    setZoraShowBadges(zora.showModelBadges ?? true);
    setZoraDefaultTone(zora.defaultTone ?? "balanced");
    setZoraShowSystemPrompts(zora.showSystemPrompts ?? false);

    // Workspace
    const workspace = anySettings.workspace ?? {};
    setWorkspaceCustomInstructions(workspace.customInstructions ?? "");
    setWorkspaceDataMode(workspace.dataManagement ?? "balanced");
    setWorkspaceStudyMode(workspace.studyMode ?? false);
    setWorkspaceDigestEnabled(workspace.digestEnabled ?? false);
    setWorkspaceAutoOrganize(workspace.autoOrganizeDocs ?? true);
    setWorkspaceSuggestFlashcards(workspace.suggestFlashcards ?? true);
    setWorkspacePinImportant(workspace.pinImportantSessions ?? true);
    setWorkspaceConnectors(
      Array.isArray(workspace.connectors) && workspace.connectors.length
        ? workspace.connectors
        : DEFAULT_CONNECTORS.map((c) => ({ ...c, enabled: true })),
    );

    // Command Center
    const commandCenter = anySettings.commandCenter ?? {};
    setCommandWidgets(
      Array.isArray(commandCenter.widgets) && commandCenter.widgets.length
        ? commandCenter.widgets
        : DEFAULT_WIDGETS.map((w) => ({ ...w, enabled: true })),
    );
    setCommandOpenOnLaunch(commandCenter.openOnLaunch ?? false);
    setCommandCompactMode(commandCenter.compactMode ?? false);
    setCommandRememberLayout(commandCenter.rememberLayout ?? true);
    setCommandGlowIntensity(commandCenter.glowIntensity ?? "normal");
    setCommandKeyboardShortcut(
      commandCenter.keyboardShortcut ?? "Ctrl + Shift + K",
    );
    setCommandShowHints(commandCenter.showHints ?? true);

    // Privacy
    const privacy = anySettings.privacy ?? {};
    setPrivacyTelemetryOptIn(privacy.telemetryOptIn ?? false);
    setPrivacyShareAnonStats(privacy.shareAnonStats ?? false);
    setPrivacyAllowModelTraining(privacy.allowModelTraining ?? false);
    setPrivacyStrictSafeSearch(privacy.strictSafeSearch ?? true);
    setPrivacyAllowExternalWeb(privacy.allowExternalWeb ?? true);
    setPrivacyAllowCommandSources(
      privacy.allowCommandCenterSources ?? true,
    );
    setPrivacyAllowedSources(
      Array.isArray(privacy.allowedSources) &&
        privacy.allowedSources.length > 0
        ? privacy.allowedSources
        : DEFAULT_SOURCES,
    );
  }, [data]);

  // --- Existing helpers -----------------------------------------------------

  const handleProviderToggle = (id: string, enabled: boolean) => {
    if (!data) return;
    const updatedProviders = data.providers.map((provider) =>
      provider.id === id ? { ...provider, enabled } : provider,
    );
    saveSettings
      .mutateAsync(createPayload(data, { providers: updatedProviders }))
      .then(() => toast.success("Provider preference saved."))
      .catch(() =>
        toast.error("Unable to update security provider preferences."),
      );
  };

  const handleApplyTheme = () => {
    if (!data) return;
    setTheme(data.appearance.theme);
    toast.success(`Applied ${data.appearance.theme} theme on this device.`);
  };

  // --- Save handlers --------------------------------------------------------

  const handleSaveZora = () => {
    if (!data) return;
    const anySettings = data as any;
    const payload = createPayload(data, {
      zora: {
        ...(anySettings.zora ?? {}),
        engineOrder,
        customInstructions: zoraCustomInstructions,
        safeMode: zoraSafeMode,
        autoChooseEngine: zoraAutoEngine,
        explainReasoning: zoraExplainReasoning,
        showModelBadges: zoraShowBadges,
        defaultTone: zoraDefaultTone,
        showSystemPrompts: zoraShowSystemPrompts,
      },
    });
    saveSettings
      .mutateAsync(payload)
      .then(() => toast.success("Zora preferences saved."))
      .catch(() => toast.error("Could not save Zora preferences."));
  };

  const handleSaveWorkspace = () => {
    if (!data) return;
    const anySettings = data as any;
    const payload = createPayload(data, {
      workspace: {
        ...(anySettings.workspace ?? {}),
        customInstructions: workspaceCustomInstructions,
        dataManagement: workspaceDataMode,
        studyMode: workspaceStudyMode,
        digestEnabled: workspaceDigestEnabled,
        autoOrganizeDocs: workspaceAutoOrganize,
        suggestFlashcards: workspaceSuggestFlashcards,
        pinImportantSessions: workspacePinImportant,
        connectors: workspaceConnectors,
      },
    });
    saveSettings
      .mutateAsync(payload)
      .then(() => toast.success("Workspace settings saved."))
      .catch(() => toast.error("Could not save Workspace settings."));
  };

  const handleSaveCommandCenter = () => {
    if (!data) return;
    const anySettings = data as any;
    const payload = createPayload(data, {
      commandCenter: {
        ...(anySettings.commandCenter ?? {}),
        widgets: commandWidgets,
        openOnLaunch: commandOpenOnLaunch,
        compactMode: commandCompactMode,
        rememberLayout: commandRememberLayout,
        glowIntensity: commandGlowIntensity,
        keyboardShortcut: commandKeyboardShortcut,
        showHints: commandShowHints,
      },
    });
    saveSettings
      .mutateAsync(payload)
      .then(() => toast.success("Command Center saved."))
      .catch(() => toast.error("Could not save Command Center settings."));
  };

  const handleSavePrivacy = () => {
    if (!data) return;
    const anySettings = data as any;
    const payload = createPayload(data, {
      privacy: {
        ...(anySettings.privacy ?? {}),
        telemetryOptIn: privacyTelemetryOptIn,
        shareAnonStats: privacyShareAnonStats,
        allowModelTraining: privacyAllowModelTraining,
        strictSafeSearch: privacyStrictSafeSearch,
        allowExternalWeb: privacyAllowExternalWeb,
        allowCommandCenterSources: privacyAllowCommandSources,
        allowedSources: privacyAllowedSources,
        telemetryLastUpdated: new Date().toISOString(),
      },
    });
    saveSettings
      .mutateAsync(payload)
      .then(() => toast.success("Privacy & security settings saved."))
      .catch(() =>
        toast.error("Could not save Privacy & security preferences."),
      );
  };

  // --- Telemetry consent flow ----------------------------------------------

  const handleTelemetrySwitch = (checked: boolean) => {
    if (checked) {
      setPendingTelemetryValue(true);
      setShowTelemetryConsent(true);
    } else {
      setPrivacyTelemetryOptIn(false);
    }
  };

  const confirmTelemetryOptIn = () => {
    if (pendingTelemetryValue) {
      setPrivacyTelemetryOptIn(true);
    }
    setPendingTelemetryValue(null);
    setShowTelemetryConsent(false);
  };

  const cancelTelemetryOptIn = () => {
    setPendingTelemetryValue(null);
    setShowTelemetryConsent(false);
    setPrivacyTelemetryOptIn(false);
  };

  // --- Loading & error states ----------------------------------------------

  if (isLoading) {
    return (
      <div className="px-[var(--page-padding)] py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="panel panel--glassy panel--hover panel--immersive panel--alive p-5"
            >
              <SkeletonBlock />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
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

  // --- Main layout ----------------------------------------------------------

  return (
    <>
      <div className="px-[var(--page-padding)] py-6">
        {/* Page header ------------------------------------------------------- */}
        <header className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.9)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.72)]">
                Settings
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[rgb(var(--text))]">
                Tune how Zora behaves, learns, and protects you.
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-[rgba(var(--subtle),0.82)]">
                Adjust preferences across the AI engine, your Workspace, the
                Command Center, and privacy. Most changes apply instantly;
                anything sensitive will always ask for your consent.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <div className="rounded-2xl border border-[rgba(var(--border),0.5)] bg-[rgba(var(--panel),0.9)] px-4 py-2 text-xs text-[rgba(var(--subtle),0.8)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.75)]">
                  Workspace identity
                </p>
                <p className="mt-1 text-sm font-semibold text-[rgb(var(--text))]">
                  {data.profile.displayName}
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  {data.profile.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyTheme}
                className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
              >
                <CheckCircle2 className="size-4" /> Apply {data.appearance.theme}{" "}
                theme
              </button>
            </div>
          </div>
        </header>

        {/* Tabs + content ---------------------------------------------------- */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          {/* Left: tab list */}
          <aside className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.95)] p-4 text-sm">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4 text-brand" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.8)]">
                Sections
              </p>
            </div>
            <ul className="mt-4 space-y-1">
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full flex-col rounded-2xl px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.6)] focus:ring-offset-2 focus:ring-offset-[rgb(var(--surface))] ${
                      activeTab === tab.id
                        ? "bg-[rgba(var(--brand),0.16)] text-[rgb(var(--text))]"
                        : "bg-transparent text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--panel),0.9)]"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                      {tab.label}
                    </span>
                    <span className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.8)]">
                      {tab.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right: active tab content */}
          <section className="space-y-5">
            {activeTab === "zora" && (
              <ZoraTab
                engineOrder={engineOrder}
                onChangeEngineOrder={setEngineOrder}
                customInstructions={zoraCustomInstructions}
                onChangeCustomInstructions={setZoraCustomInstructions}
                safeMode={zoraSafeMode}
                onChangeSafeMode={setZoraSafeMode}
                autoEngine={zoraAutoEngine}
                onChangeAutoEngine={setZoraAutoEngine}
                explainReasoning={zoraExplainReasoning}
                onChangeExplainReasoning={setZoraExplainReasoning}
                showBadges={zoraShowBadges}
                onChangeShowBadges={setZoraShowBadges}
                defaultTone={zoraDefaultTone}
                onChangeDefaultTone={setZoraDefaultTone}
                showSystemPrompts={zoraShowSystemPrompts}
                onChangeShowSystemPrompts={setZoraShowSystemPrompts}
                providers={data.providers}
                onToggleProvider={handleProviderToggle}
                onSave={handleSaveZora}
                isSaving={saveSettings.isPending}
              />
            )}

            {activeTab === "workspace" && (
              <WorkspaceTab
                customInstructions={workspaceCustomInstructions}
                onChangeCustomInstructions={setWorkspaceCustomInstructions}
                dataMode={workspaceDataMode}
                onChangeDataMode={setWorkspaceDataMode}
                studyMode={workspaceStudyMode}
                onChangeStudyMode={setWorkspaceStudyMode}
                digestEnabled={workspaceDigestEnabled}
                onChangeDigestEnabled={setWorkspaceDigestEnabled}
                autoOrganize={workspaceAutoOrganize}
                onChangeAutoOrganize={setWorkspaceAutoOrganize}
                suggestFlashcards={workspaceSuggestFlashcards}
                onChangeSuggestFlashcards={setWorkspaceSuggestFlashcards}
                pinImportant={workspacePinImportant}
                onChangePinImportant={setWorkspacePinImportant}
                connectors={workspaceConnectors}
                onChangeConnectors={setWorkspaceConnectors}
                onRequestDigest={() => {
                  requestDocumentsView("workspace-daily-digest");
                  toast.success(
                    "Daily Workspace digest requested. It will open in a new view when ready.",
                  );
                }}
                onSave={handleSaveWorkspace}
                isSaving={saveSettings.isPending}
              />
            )}

            {activeTab === "commandCenter" && (
              <CommandCenterTab
                widgets={commandWidgets}
                onChangeWidgets={setCommandWidgets}
                openOnLaunch={commandOpenOnLaunch}
                onChangeOpenOnLaunch={setCommandOpenOnLaunch}
                compactMode={commandCompactMode}
                onChangeCompactMode={setCommandCompactMode}
                rememberLayout={commandRememberLayout}
                onChangeRememberLayout={setCommandRememberLayout}
                glowIntensity={commandGlowIntensity}
                onChangeGlowIntensity={setCommandGlowIntensity}
                keyboardShortcut={commandKeyboardShortcut}
                onChangeKeyboardShortcut={setCommandKeyboardShortcut}
                showHints={commandShowHints}
                onChangeShowHints={setCommandShowHints}
                onSave={handleSaveCommandCenter}
                isSaving={saveSettings.isPending}
              />
            )}

            {activeTab === "privacy" && (
              <PrivacyTab
                telemetryOptIn={privacyTelemetryOptIn}
                onTelemetryToggle={handleTelemetrySwitch}
                shareAnonStats={privacyShareAnonStats}
                onChangeShareAnonStats={setPrivacyShareAnonStats}
                allowModelTraining={privacyAllowModelTraining}
                onChangeAllowModelTraining={setPrivacyAllowModelTraining}
                strictSafeSearch={privacyStrictSafeSearch}
                onChangeStrictSafeSearch={setPrivacyStrictSafeSearch}
                allowExternalWeb={privacyAllowExternalWeb}
                onChangeAllowExternalWeb={setPrivacyAllowExternalWeb}
                allowCommandSources={privacyAllowCommandSources}
                onChangeAllowCommandSources={setPrivacyAllowCommandSources}
                allowedSources={privacyAllowedSources}
                onChangeAllowedSources={setPrivacyAllowedSources}
                onSave={handleSavePrivacy}
                isSaving={saveSettings.isPending}
              />
            )}
          </section>
        </div>
      </div>

      {showTelemetryConsent && (
        <TelemetryConsentModal
          onConfirm={confirmTelemetryOptIn}
          onCancel={cancelTelemetryOptIn}
        />
      )}
    </>
  );
}

export default Settings;

// ==========================================================================
// Sub-components
// ==========================================================================

type ZoraTabProps = {
  engineOrder: string[];
  onChangeEngineOrder: (order: string[]) => void;
  customInstructions: string;
  onChangeCustomInstructions: (v: string) => void;
  safeMode: boolean;
  onChangeSafeMode: (v: boolean) => void;
  autoEngine: boolean;
  onChangeAutoEngine: (v: boolean) => void;
  explainReasoning: boolean;
  onChangeExplainReasoning: (v: boolean) => void;
  showBadges: boolean;
  onChangeShowBadges: (v: boolean) => void;
  defaultTone: "balanced" | "precise" | "creative";
  onChangeDefaultTone: (v: "balanced" | "precise" | "creative") => void;
  showSystemPrompts: boolean;
  onChangeShowSystemPrompts: (v: boolean) => void;
  providers: SettingsData["providers"];
  onToggleProvider: (id: string, enabled: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
};

function ZoraTab({
  engineOrder,
  onChangeEngineOrder,
  customInstructions,
  onChangeCustomInstructions,
  safeMode,
  onChangeSafeMode,
  autoEngine,
  onChangeAutoEngine,
  explainReasoning,
  onChangeExplainReasoning,
  showBadges,
  onChangeShowBadges,
  defaultTone,
  onChangeDefaultTone,
  showSystemPrompts,
  onChangeShowSystemPrompts,
  providers,
  onToggleProvider,
  onSave,
  isSaving,
}: ZoraTabProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleReorder = (from: number, to: number) => {
    if (from === to) return;
    onChangeEngineOrder(moveItem(engineOrder, from, to));
  };

  return (
    <>
      {/* Engine ranking */}
      <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Zora engine
            </p>
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
              Rank your engines
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.85)]">
              Drag to reorder or use the arrows. Zora will prefer engines at the
              top for Analyze-style tasks, then fall back to the rest as needed.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand-soft),0.2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            <Sparkles className="size-3.5" /> Smart routing on
          </span>
        </header>

        <ol className="mt-4 space-y-2 text-sm">
          {engineOrder.map((id, index) => {
            const meta = getEngineMeta(id);
            const position = index + 1;

            return (
              <li
                key={id}
                draggable
                onDragStart={(event) => {
                  setDragIndex(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null) {
                    handleReorder(dragIndex, index);
                    setDragIndex(null);
                  }
                }}
                className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.32)] bg-[rgba(var(--panel),0.6)] px-3 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[rgba(var(--border),0.3)] text-[11px] font-semibold text-[rgb(var(--text))]">
                    {position}
                  </span>
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      {meta.label}
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.82)]">
                      {meta.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-full bg-[rgba(var(--surface),0.96)] p-1 text-[rgba(var(--subtle),0.8)] hover:text-brand"
                    disabled={index === 0}
                    onClick={() => handleReorder(index, index - 1)}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-[rgba(var(--surface),0.96)] p-1 text-[rgba(var(--subtle),0.8)] hover:text-brand"
                    disabled={index === engineOrder.length - 1}
                    onClick={() => handleReorder(index, index + 1)}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Behaviour toggles + custom instructions */}
      <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Behaviour toggles */}
          <div>
            <header>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Behaviour
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                How Zora behaves by default
              </h3>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
                These switches affect Zora everywhere: Workspace, Command
                Center, and standalone chat.
              </p>
            </header>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
                <div>
                  <dt className="font-semibold text-[rgb(var(--text))]">
                    Safe mode
                  </dt>
                  <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                    Extra-strict filters on sensitive topics and risky
                    suggestions.
                  </dd>
                </div>
                <Switch
                  checked={safeMode}
                  onCheckedChange={onChangeSafeMode}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
                <div>
                  <dt className="font-semibold text-[rgb(var(--text))]">
                    Auto-choose engine
                  </dt>
                  <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                    Let Zora pick the best model for each request using your
                    ranking as a bias.
                  </dd>
                </div>
                <Switch
                  checked={autoEngine}
                  onCheckedChange={onChangeAutoEngine}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
                <div>
                  <dt className="font-semibold text-[rgb(var(--text))]">
                    Explain reasoning
                  </dt>
                  <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                    Ask Zora to briefly explain why it chose a model or answer
                    path.
                  </dd>
                </div>
                <Switch
                  checked={explainReasoning}
                  onCheckedChange={onChangeExplainReasoning}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
                <div>
                  <dt className="font-semibold text-[rgb(var(--text))]">
                    Show model badges
                  </dt>
                  <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                    Display which engine answered each message in the UI.
                  </dd>
                </div>
                <Switch
                  checked={showBadges}
                  onCheckedChange={onChangeShowBadges}
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
                <div>
                  <dt className="font-semibold text-[rgb(var(--text))]">
                    Show system prompts
                  </dt>
                  <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                    Allow advanced users to reveal the underlying system
                    messages used for each run.
                  </dd>
                </div>
                <Switch
                  checked={showSystemPrompts}
                  onCheckedChange={onChangeShowSystemPrompts}
                />
              </div>

              <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
                <dt className="mb-1 text-sm font-semibold text-[rgb(var(--text))]">
                  Default tone
                </dt>
                <dd className="flex flex-wrap gap-2 text-[11px]">
                  {[
                    { id: "balanced", label: "Balanced" },
                    { id: "precise", label: "Precise" },
                    { id: "creative", label: "Creative" },
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() =>
                        onChangeDefaultTone(
                          tone.id as "balanced" | "precise" | "creative",
                        )
                      }
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        defaultTone === tone.id
                          ? "bg-[rgba(var(--brand),0.2)] text-brand"
                          : "bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.5)]"
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Custom instructions */}
          <div className="flex flex-col rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.82)] p-4">
            <header className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-brand" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.76)]">
                  Custom instructions
                </p>
                <p className="text-xs text-[rgba(var(--subtle),0.84)]">
                  Tell Zora how you like answers to look, what matters to you,
                  and anything it should always keep in mind.
                </p>
              </div>
            </header>
            <textarea
              value={customInstructions}
              onChange={(event) => onChangeCustomInstructions(event.target.value)}
              placeholder="Example: “Always prioritise reliability over speed. I’m preparing for long-form study, so keep a calm, encouraging tone and call out key risks clearly.”"
              className="mt-3 min-h-[180px] flex-1 resize-none rounded-2xl border border-[rgba(var(--border),0.5)] bg-[rgba(var(--surface),0.96)] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.7)]"
            />
            <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
              There&apos;s no character limit here. Zora will summarise and
              compress this behind the scenes so it can travel with you across
              Workspace and Command Center.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="ml-2">Save Zora settings</span>
          </button>
        </div>
      </section>

      {/* Security providers */}
      <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Engine guardrails
            </p>
            <h3 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
              Security providers
            </h3>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
              Toggle integrations as you wire Zora to production-grade safety
              systems. These sit underneath the engine ranking.
            </p>
          </div>
          <Shield className="size-6 text-brand" />
        </header>
        <ul className="mt-4 space-y-2 text-sm">
          {providers.map((provider) => (
            <li
              key={provider.id}
              className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5"
            >
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  {provider.name}
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  {provider.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <Switch
                checked={provider.enabled}
                onCheckedChange={(checked) =>
                  onToggleProvider(provider.id, checked)
                }
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// --------------------------------------------------------------------------
// Workspace tab
// --------------------------------------------------------------------------

type WorkspaceTabProps = {
  customInstructions: string;
  onChangeCustomInstructions: (v: string) => void;
  dataMode: "compact" | "balanced" | "rich";
  onChangeDataMode: (v: "compact" | "balanced" | "rich") => void;
  studyMode: boolean;
  onChangeStudyMode: (v: boolean) => void;
  digestEnabled: boolean;
  onChangeDigestEnabled: (v: boolean) => void;
  autoOrganize: boolean;
  onChangeAutoOrganize: (v: boolean) => void;
  suggestFlashcards: boolean;
  onChangeSuggestFlashcards: (v: boolean) => void;
  pinImportant: boolean;
  onChangePinImportant: (v: boolean) => void;
  connectors: Array<{ id: string; label: string; description: string; enabled: boolean }>;
  onChangeConnectors: (
    connectors: Array<{
      id: string;
      label: string;
      description: string;
      enabled: boolean;
    }>,
  ) => void;
  onRequestDigest: () => void;
  onSave: () => void;
  isSaving: boolean;
};

function WorkspaceTab({
  customInstructions,
  onChangeCustomInstructions,
  dataMode,
  onChangeDataMode,
  studyMode,
  onChangeStudyMode,
  digestEnabled,
  onChangeDigestEnabled,
  autoOrganize,
  onChangeAutoOrganize,
  suggestFlashcards,
  onChangeSuggestFlashcards,
  pinImportant,
  onChangePinImportant,
  connectors,
  onChangeConnectors,
  onRequestDigest,
  onSave,
  isSaving,
}: WorkspaceTabProps) {
  const handleConnectorToggle = (id: string, enabled: boolean) => {
    onChangeConnectors(
      connectors.map((c) =>
        c.id === id ? { ...c, enabled } : c,
      ),
    );
  };

  return (
    <>
      <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Workspace
            </p>
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
              Study, organising, and daily rhythm
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
              These controls define how Workspace behaves as your study / work
              hub: how aggressively it organises, what it saves, and how it
              reports back.
            </p>
          </div>
          <PlugZap className="size-6 text-brand" />
        </header>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Study mode
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Turn on spaced repetition, flashcard suggestions, and calmer
                  answer styles.
                </p>
              </div>
              <Switch
                checked={studyMode}
                onCheckedChange={onChangeStudyMode}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Auto-organise documents
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Workspace will create folders, tags, and bundles from your
                  uploads automatically.
                </p>
              </div>
              <Switch
                checked={autoOrganize}
                onCheckedChange={onChangeAutoOrganize}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Suggest flashcards
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Zora turns highlights and answers into structured practice
                  questions.
                </p>
              </div>
              <Switch
                checked={suggestFlashcards}
                onCheckedChange={onChangeSuggestFlashcards}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Pin important sessions
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Workspace keeps high-signal chats and docs at the top for
                  quick access.
                </p>
              </div>
              <Switch
                checked={pinImportant}
                onCheckedChange={onChangePinImportant}
              />
            </div>

            <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                Data management style
              </p>
              <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
                Balance how aggressively Workspace stores, tags, and cleans up
                your data.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {[
                  { id: "compact", label: "Compact" },
                  { id: "balanced", label: "Balanced" },
                  { id: "rich", label: "Rich history" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      onChangeDataMode(
                        mode.id as "compact" | "balanced" | "rich",
                      )
                    }
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      dataMode === mode.id
                        ? "bg-[rgba(var(--brand),0.2)] text-brand"
                        : "bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.5)]"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Daily Workspace digest
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Receive a short summary of what you searched, ignored, and how
                  to make tomorrow smoother. Each report is capped at 1,000
                  words.
                </p>
                <button
                  type="button"
                  onClick={onRequestDigest}
                  className="mt-1 text-[11px] font-semibold text-brand underline-offset-2 hover:underline"
                >
                  Generate today&apos;s digest
                </button>
              </div>
              <Switch
                checked={digestEnabled}
                onCheckedChange={onChangeDigestEnabled}
              />
            </div>
          </div>

          {/* Custom instructions */}
          <div className="flex flex-col rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.82)] p-4">
            <header className="flex items-center gap-2">
              <Activity className="size-4 text-brand" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.76)]">
                  Workspace instructions
                </p>
                <p className="text-xs text-[rgba(var(--subtle),0.84)]">
                  Describe how Workspace should handle docs, flashcards, and
                  study sessions for you.
                </p>
              </div>
            </header>
            <textarea
              value={customInstructions}
              onChange={(event) =>
                onChangeCustomInstructions(event.target.value)
              }
              placeholder="Example: “Group everything for my LMSW prep into one folder, prioritise practice questions over summaries, and highlight any policy-heavy content I should revisit.”"
              className="mt-3 min-h-[180px] flex-1 resize-none rounded-2xl border border-[rgba(var(--border),0.5)] bg-[rgba(var(--surface),0.96)] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.7)]"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="ml-2">Save Workspace settings</span>
          </button>
        </div>
      </section>

      {/* Connectors */}
      <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Connectors
            </p>
            <h3 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
              What Workspace can see
            </h3>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
              Turn sources on or off. When you&apos;re ready for more, add new
              connectors from here.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              toast.info("Connection catalog will open in a future release.")
            }
            className="btn btn-ghost btn-neo btn-quiet rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand"
          >
            + Add connection
          </button>
        </header>

        <ul className="mt-4 space-y-2 text-sm">
          {connectors.map((connector) => (
            <li
              key={connector.id}
              className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5"
            >
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  {connector.label}
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  {connector.description}
                </p>
              </div>
              <Switch
                checked={connector.enabled}
                onCheckedChange={(checked) =>
                  handleConnectorToggle(connector.id, checked)
                }
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

// --------------------------------------------------------------------------
// Command Center tab
// --------------------------------------------------------------------------

type CommandCenterTabProps = {
  widgets: Array<{ id: string; label: string; description: string; enabled: boolean }>;
  onChangeWidgets: (
    widgets: Array<{
      id: string;
      label: string;
      description: string;
      enabled: boolean;
    }>,
  ) => void;
  openOnLaunch: boolean;
  onChangeOpenOnLaunch: (v: boolean) => void;
  compactMode: boolean;
  onChangeCompactMode: (v: boolean) => void;
  rememberLayout: boolean;
  onChangeRememberLayout: (v: boolean) => void;
  glowIntensity: "soft" | "normal" | "strong";
  onChangeGlowIntensity: (v: "soft" | "normal" | "strong") => void;
  keyboardShortcut: string;
  onChangeKeyboardShortcut: (v: string) => void;
  showHints: boolean;
  onChangeShowHints: (v: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
};

function CommandCenterTab({
  widgets,
  onChangeWidgets,
  openOnLaunch,
  onChangeOpenOnLaunch,
  compactMode,
  onChangeCompactMode,
  rememberLayout,
  onChangeRememberLayout,
  glowIntensity,
  onChangeGlowIntensity,
  keyboardShortcut,
  onChangeKeyboardShortcut,
  showHints,
  onChangeShowHints,
  onSave,
  isSaving,
}: CommandCenterTabProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleReorder = (from: number, to: number) => {
    if (from === to) return;
    onChangeWidgets(moveItem(widgets, from, to));
  };

  const handleWidgetToggle = (id: string, enabled: boolean) => {
    onChangeWidgets(
      widgets.map((w) => (w.id === id ? { ...w, enabled } : w)),
    );
  };

  return (
    <>
      <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Command Center
            </p>
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
              Layout & widgets
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
              Command Center turns Zora from “chat” into “application”. Choose
              which widgets are visible and how they behave when you open it.
            </p>
          </div>
          <Globe2 className="size-6 text-brand" />
        </header>

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Widgets */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.78)]">
              Widgets
            </p>
            <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.84)]">
              Drag to reorder. Zora will reserve more space for widgets at the
              top of the list.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {widgets.map((widget, index) => (
                <li
                  key={widget.id}
                  draggable
                  onDragStart={(event) => {
                    setDragIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", widget.id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragIndex !== null) {
                      handleReorder(dragIndex, index);
                      setDragIndex(null);
                    }
                  }}
                  className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[rgba(var(--border),0.3)] text-[11px] font-semibold text-[rgb(var(--text))]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[rgb(var(--text))]">
                        {widget.label}
                      </p>
                      <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                        {widget.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-[rgba(var(--surface),0.96)] p-1 text-[rgba(var(--subtle),0.8)] hover:text-brand"
                      disabled={index === 0}
                      onClick={() => handleReorder(index, index - 1)}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-[rgba(var(--surface),0.96)] p-1 text-[rgba(var(--subtle),0.8)] hover:text-brand"
                      disabled={index === widgets.length - 1}
                      onClick={() => handleReorder(index, index + 1)}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={(checked) =>
                        handleWidgetToggle(widget.id, checked)
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Behaviour switches */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Open Command Center on launch
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  When enabled, Zora opens straight into the Command Center
                  instead of chat.
                </p>
              </div>
              <Switch
                checked={openOnLaunch}
                onCheckedChange={onChangeOpenOnLaunch}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Compact layout
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Tighter spacing and smaller cards when screen real-estate is
                  precious.
                </p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={onChangeCompactMode}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Remember layout
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Keep your widget order, collapsed panels, and filters from the
                  last session.
                </p>
              </div>
              <Switch
                checked={rememberLayout}
                onCheckedChange={onChangeRememberLayout}
              />
            </div>

            <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                Command Center glow
              </p>
              <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
                Subtle visual “life” around the Command Center button in the
                header.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {[
                  { id: "soft", label: "Soft" },
                  { id: "normal", label: "Normal" },
                  { id: "strong", label: "Strong" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      onChangeGlowIntensity(
                        option.id as "soft" | "normal" | "strong",
                      )
                    }
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      glowIntensity === option.id
                        ? "bg-[rgba(var(--brand),0.2)] text-brand"
                        : "bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.5)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                Keyboard shortcut
              </p>
              <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
                Choose how you want to summon the Command Center from anywhere
                in Zora.
              </p>
              <input
                type="text"
                value={keyboardShortcut}
                onChange={(event) =>
                  onChangeKeyboardShortcut(event.target.value)
                }
                className="mt-2 w-full rounded-full border border-[rgba(var(--border),0.5)] bg-[rgba(var(--surface),0.96)] px-3 py-1.5 text-xs text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.7)]"
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
              <div>
                <p className="font-semibold text-[rgb(var(--text))]">
                  Show inline hints
                </p>
                <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Tiny helper text underneath widgets for new users. Good for
                  onboarding, easy to turn off later.
                </p>
              </div>
              <Switch
                checked={showHints}
                onCheckedChange={onChangeShowHints}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span className="ml-2">Save Command Center</span>
          </button>
        </div>
      </section>
    </>
  );
}

// --------------------------------------------------------------------------
// Privacy & security tab
// --------------------------------------------------------------------------

type PrivacyTabProps = {
  telemetryOptIn: boolean;
  onTelemetryToggle: (v: boolean) => void;
  shareAnonStats: boolean;
  onChangeShareAnonStats: (v: boolean) => void;
  allowModelTraining: boolean;
  onChangeAllowModelTraining: (v: boolean) => void;
  strictSafeSearch: boolean;
  onChangeStrictSafeSearch: (v: boolean) => void;
  allowExternalWeb: boolean;
  onChangeAllowExternalWeb: (v: boolean) => void;
  allowCommandSources: boolean;
  onChangeAllowCommandSources: (v: boolean) => void;
  allowedSources: string[];
  onChangeAllowedSources: (v: string[]) => void;
  onSave: () => void;
  isSaving: boolean;
};

function PrivacyTab({
  telemetryOptIn,
  onTelemetryToggle,
  shareAnonStats,
  onChangeShareAnonStats,
  allowModelTraining,
  onChangeAllowModelTraining,
  strictSafeSearch,
  onChangeStrictSafeSearch,
  allowExternalWeb,
  onChangeAllowExternalWeb,
  allowCommandSources,
  onChangeAllowCommandSources,
  allowedSources,
  onChangeAllowedSources,
  onSave,
  isSaving,
}: PrivacyTabProps) {
  const toggleSource = (source: string) => {
    if (allowedSources.includes(source)) {
      onChangeAllowedSources(
        allowedSources.filter((s) => s !== source),
      );
    } else {
      onChangeAllowedSources([...allowedSources, source]);
    }
  };

  return (
    <section className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Privacy & security
          </p>
          <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
            You stay in control
          </h2>
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
            Zora is designed to feel powerful without feeling invasive. These
            settings let you decide what&apos;s logged, what leaves your
            account, and which sources can be used.
          </p>
        </div>
        <Lock className="size-6 text-brand" />
      </header>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Left side */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Opt-in telemetry
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                When enabled, we collect anonymised telemetry on hallucinations,
                API behaviour, and usage patterns to make Zora more accurate.
                Aggregated trends may be shared with model providers to improve
                their systems.
              </p>
            </div>
            <Switch
              checked={telemetryOptIn}
              onCheckedChange={onTelemetryToggle}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Share anonymous statistics
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                Allow us to use aggregated metrics (not raw content) to
                understand feature usage and reliability.
              </p>
            </div>
            <Switch
              checked={shareAnonStats}
              onCheckedChange={onChangeShareAnonStats}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Allow model providers to learn from my data
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                When off, we only use your data to operate Zora. When on,
                anonymised patterns may help train and evaluate third-party
                models.
              </p>
            </div>
            <Switch
              checked={allowModelTraining}
              onCheckedChange={onChangeAllowModelTraining}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Strict SafeSearch
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                Extra filtering for violent, explicit, or abusive material when
                Zora uses web results.
              </p>
            </div>
            <Switch
              checked={strictSafeSearch}
              onCheckedChange={onChangeStrictSafeSearch}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Allow external web access
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                When disabled, Zora stays fully local to your Workspace,
                Command Center, and connectors only.
              </p>
            </div>
            <Switch
              checked={allowExternalWeb}
              onCheckedChange={onChangeAllowExternalWeb}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] px-3 py-2.5">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Allow Command Center as a data source
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                Use projects and research signals from Command Center when
                answering related prompts.
              </p>
            </div>
            <Switch
              checked={allowCommandSources}
              onCheckedChange={onChangeAllowCommandSources}
            />
          </div>
        </div>

        {/* Right side: sources list */}
        <div className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.8)] px-4 py-4 text-sm">
          <header className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Sources
              </p>
              <p className="text-xs text-[rgba(var(--subtle),0.84)]">
                Choose which buckets of data Zora is allowed to pull from when
                answering.
              </p>
            </div>
          </header>
          <ul className="mt-3 space-y-2 text-[11px]">
            {DEFAULT_SOURCES.map((source) => {
              const active = allowedSources.includes(source);
              return (
                <li key={source}>
                  <button
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left font-semibold transition ${
                      active
                        ? "border-[rgba(var(--brand),0.7)] bg-[rgba(var(--brand-soft),0.2)] text-brand"
                        : "border-[rgba(var(--border),0.5)] bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.45)]"
                    }`}
                  >
                    <span>{source}</span>
                    <span className="text-[10px]">
                      {active ? "Allowed" : "Blocked"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[10px] text-[rgba(var(--subtle),0.75)]">
            Changing these settings only affects how Zora answers. It does not
            retroactively delete any content; use Workspace tools when you want
            to fully remove data.
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span className="ml-2">Save Privacy & security</span>
        </button>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Telemetry consent modal
// --------------------------------------------------------------------------

type TelemetryConsentModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

function TelemetryConsentModal({
  onConfirm,
  onCancel,
}: TelemetryConsentModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
      <div className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.98)] p-5 shadow-[var(--shadow-soft)] max-w-lg w-[90%]">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex size-8 items-center justify-center rounded-full bg-[rgba(var(--brand-soft),0.25)]">
            <Activity className="size-4 text-brand" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[rgb(var(--text))]">
              Turn on opt-in telemetry?
            </h2>
            <p className="mt-2 text-sm text-[rgba(var(--subtle),0.88)]">
              Telemetry helps us understand how Zora behaves in the wild so we
              can make it more accurate and reliable. When enabled, we collect
              anonymised information about hallucinations, API errors, and model
              choices—but not the raw content of your conversations.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-[rgba(var(--subtle),0.9)]">
              <li>You can turn telemetry off again at any time in Settings.</li>
              <li>
                Data is aggregated and may be shared with model providers to
                improve their systems.
              </li>
              <li>We never sell personally identifiable information.</li>
            </ul>
            <div className="mt-4 flex flex-wrap justify-end gap-2 text-sm">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-ghost btn-neo btn-quiet rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.9)]"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
              >
                <ShieldCheck className="size-4" />
                <span className="ml-2">Agree & turn on telemetry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
