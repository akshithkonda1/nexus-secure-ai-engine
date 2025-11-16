// src/pages/Settings.tsx
import React, { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Link2,
  Loader2,
  PlugZap,
  RefreshCcw,
  Save,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";

/* -------------------------------------------------------------------------- */
/* Types & defaults                                                           */
/* -------------------------------------------------------------------------- */

type TabId = "zora" | "workspace" | "command" | "privacy";

type EnginePreference = {
  id: string;
  label: string;
  description: string;
};

const DEFAULT_ENGINES: EnginePreference[] = [
  {
    id: "gpt-4o",
    label: "OpenAI GPT-4o",
    description: "Great all-rounder for analysis, writing, and coding.",
  },
  {
    id: "claude-3.5-sonnet",
    label: "Anthropic Claude 3.5 Sonnet",
    description: "Careful, long-context reasoning and explanation.",
  },
  {
    id: "mistral-large",
    label: "Mistral Large",
    description: "Fast multilingual model with solid reasoning.",
  },
  {
    id: "grok-2",
    label: "xAI Grok 2",
    description: "Real-time, web-aware reasoning when you need fresh info.",
  },
  {
    id: "qwen-2.5",
    label: "Qwen 2.5",
    description: "Budget-friendly model with good code and math skills.",
  },
  {
    id: "llama-3-70b",
    label: "Llama 3 70B",
    description: "Open-weights model for private or self-hosted workloads.",
  },
  {
    id: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    description: "Strong on multimodal and Google-style research tasks.",
  },
  {
    id: "titan-text-premier",
    label: "Amazon Titan Text Premier",
    description: "Bedrock-native model tuned for enterprise workloads.",
  },
  {
    id: "cohere-command-r-plus",
    label: "Cohere Command R+",
    description: "Great for RAG and tool-calling heavy workflows.",
  },
  {
    id: "local-open-source",
    label: "Local / open-source",
    description: "Whatever you wire through Bedrock, Ollama, or your stack.",
  },
];

type Tone = "balanced" | "precise" | "creative";

type ZoraSettingsState = {
  safeMode: boolean;
  autoEngine: boolean;
  explainReasoning: boolean;
  showBadges: boolean;
  showSystemPrompts: boolean;
  defaultTone: Tone;
  customInstructions: string;
  engineRanking: EnginePreference[];
};

type ConnectorState = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type WorkspaceSettingsState = {
  customInstructions: string;
  studyMode: boolean;
  autoCleanData: boolean;
  keepHistoryDays: number;
  digestEnabled: boolean;
  connectors: ConnectorState[];
};

type CommandCenterSettingsState = {
  showProjects: boolean;
  showUpcoming: boolean;
  showResearchSignals: boolean;
  showConnectorsTray: boolean;
  showFocusTimer: boolean;
  warnOnExit: boolean;
  compactCards: boolean;
};

type TelemetryLevel = "minimal" | "standard" | "full";

type PrivacySettingsState = {
  telemetryEnabled: boolean;
  telemetryLevel: TelemetryLevel;
  anonymise: boolean;
  includeWorkspaceSignals: boolean;
  includeCommandSignals: boolean;
  safeSearch: boolean;
  dataRetentionDays: number;
};

/* Workspace default connectors */
const DEFAULT_CONNECTORS: ConnectorState[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Docs, slides, and PDFs from your Google account.",
    enabled: true,
  },
  {
    id: "onedrive",
    name: "Microsoft OneDrive",
    description: "Files and folders from your Microsoft 365 workspace.",
    enabled: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Pages and databases from your Notion workspace.",
    enabled: false,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repos, READMEs, and issues for coding workflows.",
    enabled: false,
  },
  {
    id: "canvas",
    name: "Canvas / LMS",
    description: "Course content, assignments, and announcements.",
    enabled: false,
  },
];

/* -------------------------------------------------------------------------- */
/* iOS-style switch                                                           */
/* -------------------------------------------------------------------------- */

type IOSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

function IOSwitch({ checked, onCheckedChange, disabled }: IOSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onCheckedChange(!checked);
      }}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200",
        checked
          ? "border-[rgba(var(--brand),0.7)] bg-[rgb(var(--brand))]"
          : "border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.85)]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.12)]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Settings component                                                    */
/* -------------------------------------------------------------------------- */

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  const [activeTab, setActiveTab] = useState<TabId>("zora");

  const [zoraState, setZoraState] = useState<ZoraSettingsState | null>(null);
  const [workspaceState, setWorkspaceState] =
    useState<WorkspaceSettingsState | null>(null);
  const [commandState, setCommandState] =
    useState<CommandCenterSettingsState | null>(null);
  const [privacyState, setPrivacyState] =
    useState<PrivacySettingsState | null>(null);

  /* hydrate local state from server payload once */
  useEffect(() => {
    if (!data) return;
    const anyData = data as any;

    if (!zoraState) {
      const src = anyData.zoraSettings || {};
      setZoraState({
        safeMode: src.safeMode ?? true,
        autoEngine: src.autoEngine ?? true,
        explainReasoning: src.explainReasoning ?? false,
        showBadges: src.showBadges ?? true,
        showSystemPrompts: src.showSystemPrompts ?? false,
        defaultTone: src.defaultTone ?? "balanced",
        customInstructions: src.customInstructions ?? "",
        engineRanking: src.engineRanking ?? DEFAULT_ENGINES,
      });
    }

    if (!workspaceState) {
      const src = anyData.workspaceSettings || {};
      setWorkspaceState({
        customInstructions: src.customInstructions ?? "",
        studyMode: src.studyMode ?? false,
        autoCleanData: src.autoCleanData ?? true,
        keepHistoryDays: src.keepHistoryDays ?? 90,
        digestEnabled: src.digestEnabled ?? false,
        connectors: src.connectors ?? DEFAULT_CONNECTORS,
      });
    }

    if (!commandState) {
      const src = anyData.commandCenterSettings || {};
      setCommandState({
        showProjects: src.showProjects ?? true,
        showUpcoming: src.showUpcoming ?? true,
        showResearchSignals: src.showResearchSignals ?? true,
        showConnectorsTray: src.showConnectorsTray ?? false,
        showFocusTimer: src.showFocusTimer ?? false,
        warnOnExit: src.warnOnExit ?? true,
        compactCards: src.compactCards ?? false,
      });
    }

    if (!privacyState) {
      const src = anyData.privacySettings || {};
      setPrivacyState({
        telemetryEnabled: src.telemetryEnabled ?? false,
        telemetryLevel: src.telemetryLevel ?? "standard",
        anonymise: src.anonymise ?? true,
        includeWorkspaceSignals: src.includeWorkspaceSignals ?? true,
        includeCommandSignals: src.includeCommandSignals ?? true,
        safeSearch: src.safeSearch ?? true,
        dataRetentionDays: src.dataRetentionDays ?? 90,
      });
    }
  }, [data, zoraState, workspaceState, commandState, privacyState]);

  const applyThemeForDevice = () => {
    if (!data) return;
    setTheme(data.appearance.theme);
    toast.success(`Applied ${data.appearance.theme} theme for this device.`);
  };

  const saveWithPatch = async (patch: Partial<any>, label: string) => {
    if (!data) return;
    const next = {
      ...(data as any),
      ...patch,
    } as SettingsData;

    try {
      await saveSettings.mutateAsync(next);
      toast.success(`${label} saved.`);
    } catch {
      toast.error(`Could not save ${label.toLowerCase()}.`);
    }
  };

  const handleSaveZora = () => {
    if (!zoraState) return;
    void saveWithPatch({ zoraSettings: zoraState }, "Zora settings");
  };

  const handleSaveWorkspace = () => {
    if (!workspaceState) return;
    void saveWithPatch(
      { workspaceSettings: workspaceState },
      "Workspace settings",
    );
  };

  const handleSaveCommand = () => {
    if (!commandState) return;
      void saveWithPatch(
        { commandCenterSettings: commandState },
        "Command Center settings",
      );
  };

  const handleSavePrivacy = () => {
    if (!privacyState) return;
    void saveWithPatch({ privacySettings: privacyState }, "Privacy settings");
  };

  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="px-[var(--page-padding)] py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5"
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

  if (
    !data ||
    !zoraState ||
    !workspaceState ||
    !commandState ||
    !privacyState
  ) {
    return null;
  }

  /* ---------------------------------------------------------------------- */

  return (
    <div className="px-[var(--page-padding)] py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Settings
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[rgb(var(--text))]">
            Tune how Zora, Workspace, and Command Center behave.
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.95)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.9)]">
            Theme:{" "}
            <span className="capitalize text-[rgb(var(--text))]">
              {data.appearance.theme}
            </span>
          </span>
          <button
            type="button"
            onClick={applyThemeForDevice}
            className="btn btn-ghost btn-neo btn-quiet rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand"
          >
            <CheckCircle2 className="size-4" /> Apply to this device
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-[rgba(var(--border),0.35)] pb-2 text-xs font-semibold uppercase tracking-[0.22em]">
        {[
          { id: "zora", label: "Zora" },
          { id: "workspace", label: "Workspace" },
          { id: "command", label: "Command Center" },
          { id: "privacy", label: "Privacy & security" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`rounded-full px-3 py-1 transition ${
              activeTab === tab.id
                ? "bg-[rgba(var(--brand),0.16)] text-brand"
                : "bg-[rgba(var(--panel),0.9)] text-[rgba(var(--subtle),0.85)] hover:bg-[rgba(var(--border),0.5)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6 space-y-6">
        {activeTab === "zora" && (
          <ZoraTab
            state={zoraState}
            onChange={(patch) =>
              setZoraState((prev) =>
                prev ? { ...prev, ...patch } : ({ ...patch } as ZoraSettingsState),
              )
            }
            onSave={handleSaveZora}
          />
        )}

        {activeTab === "workspace" && (
          <WorkspaceTab
            state={workspaceState}
            onChange={(patch) =>
              setWorkspaceState((prev) =>
                prev
                  ? { ...prev, ...patch }
                  : ({ ...patch } as WorkspaceSettingsState),
              )
            }
            onSave={handleSaveWorkspace}
          />
        )}

        {activeTab === "command" && (
          <CommandCenterTab
            state={commandState}
            onChange={(patch) =>
              setCommandState((prev) =>
                prev
                  ? { ...prev, ...patch }
                  : ({ ...patch } as CommandCenterSettingsState),
              )
            }
            onSave={handleSaveCommand}
          />
        )}

        {activeTab === "privacy" && (
          <PrivacyTab
            state={privacyState}
            onChange={(patch) =>
              setPrivacyState((prev) =>
                prev
                  ? { ...prev, ...patch }
                  : ({ ...patch } as PrivacySettingsState),
              )
            }
            onSave={handleSavePrivacy}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Zora tab                                                                    */
/* -------------------------------------------------------------------------- */

interface ZoraTabProps {
  state: ZoraSettingsState;
  onChange: (patch: Partial<ZoraSettingsState>) => void;
  onSave: () => void;
}

function ZoraTab({ state, onChange, onSave }: ZoraTabProps) {
  const moveEngine = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.engineRanking.length) return;
    const next = [...state.engineRanking];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange({ engineRanking: next });
  };

  const toneOptions: { id: Tone; label: string }[] = [
    { id: "balanced", label: "Balanced" },
    { id: "precise", label: "Precise" },
    { id: "creative", label: "Creative" },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Left: behaviour & engine ranking */}
      <div className="space-y-5">
        {/* Behaviour */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.92)] p-5 shadow-[var(--shadow-soft)]">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Behaviour
            </p>
            <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
              How Zora behaves by default
            </h3>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.84)]">
              These switches affect Zora everywhere: Workspace, Command Center,
              and standalone chat.
            </p>
          </header>

          <dl className="mt-4 space-y-3 text-sm">
            {/* Safe mode */}
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Safe mode
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Extra-strict filters on sensitive topics and risky
                  suggestions.
                </dd>
              </div>
              <IOSwitch
                checked={state.safeMode}
                onCheckedChange={(checked) => onChange({ safeMode: checked })}
              />
            </div>

            {/* Auto-choose engine */}
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Auto-choose engine
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Let Zora pick the best model for each request using your
                  ranking as a bias.
                </dd>
              </div>
              <IOSwitch
                checked={state.autoEngine}
                onCheckedChange={(checked) => onChange({ autoEngine: checked })}
              />
            </div>

            {/* Explain reasoning */}
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Explain reasoning
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Ask Zora to briefly explain why it chose a model or answer
                  path.
                </dd>
              </div>
              <IOSwitch
                checked={state.explainReasoning}
                onCheckedChange={(checked) =>
                  onChange({ explainReasoning: checked })
                }
              />
            </div>

            {/* Show model badges */}
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Show model badges
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Display which engine answered each message in the UI.
                </dd>
              </div>
              <IOSwitch
                checked={state.showBadges}
                onCheckedChange={(checked) => onChange({ showBadges: checked })}
              />
            </div>

            {/* Show system prompts */}
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Show system prompts
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Allow advanced users to reveal the underlying system messages
                  used for each run.
                </dd>
              </div>
              <IOSwitch
                checked={state.showSystemPrompts}
                onCheckedChange={(checked) =>
                  onChange({ showSystemPrompts: checked })
                }
              />
            </div>

            {/* Default tone */}
            <div className="rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
              <dt className="mb-1 text-sm font-semibold text-[rgb(var(--text))]">
                Default tone
              </dt>
              <dd className="flex flex-wrap gap-2 text-[11px]">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => onChange({ defaultTone: tone.id })}
                    className={`rounded-full px-3 py-1 font-semibold transition ${
                      state.defaultTone === tone.id
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

        {/* Engine ranking */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.92)] p-5 shadow-[var(--shadow-soft)]">
          <header className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Engines
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                Rank your engines
              </h3>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
                Zora will try engines in this order for complex tasks when
                auto-choose is enabled. You can still override per request.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand-soft),0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
              <Sparkles className="size-3.5" />
              No drag yet — use arrows
            </span>
          </header>

          <ol className="mt-4 space-y-2 text-sm">
            {state.engineRanking.map((engine, index) => (
              <li
                key={engine.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.95)] px-3 py-2.5"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-[rgba(var(--border),0.6)] text-[11px] font-semibold text-[rgba(var(--subtle),0.95)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[rgb(var(--text))]">
                      {engine.label}
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.82)]">
                      {engine.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="inline-flex overflow-hidden rounded-full border border-[rgba(var(--border),0.5)] bg-[rgba(var(--surface),0.96)]">
                    <button
                      type="button"
                      onClick={() => moveEngine(index, -1)}
                      className="px-2 py-1 text-[11px] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.5)] disabled:opacity-40"
                      disabled={index === 0}
                    >
                      <ChevronUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveEngine(index, 1)}
                      className="px-2 py-1 text-[11px] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.5)] disabled:opacity-40"
                      disabled={index === state.engineRanking.length - 1}
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Right: custom instructions */}
      <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Custom instructions
          </p>
          <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
            Tell Zora how to think about you.
          </h3>
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
            Explain what matters to you, how formal you want answers to be, and
            any standing preferences. Zora compresses this behind the scenes so
            it can travel with you across Workspace and Command Center.
          </p>
        </header>

        <div className="mt-4 space-y-2 text-xs text-[rgba(var(--subtle),0.85)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
            Example
          </p>
          <p className="rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.96)] p-3">
            “Always prioritise reliability over speed. I&apos;m preparing for
            long-form study, so keep a calm, encouraging tone, cite sources when
            you can, and call out key risks clearly.”
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="zora-custom-instructions" className="sr-only">
            Custom instructions for Zora
          </label>
          <textarea
            id="zora-custom-instructions"
            value={state.customInstructions}
            onChange={(event) =>
              onChange({ customInstructions: event.target.value })
            }
            rows={10}
            placeholder="Tell Zora how you like to work. There’s no character limit."
            className="w-full resize-none rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.98)] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.5)]"
          />
          <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.78)]">
            There’s no character limit here. Zora will summarise and compress
            this behind the scenes to keep responses consistent.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            <Save className="size-4" /> Save Zora settings
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Workspace tab                                                              */
/* -------------------------------------------------------------------------- */

interface WorkspaceTabProps {
  state: WorkspaceSettingsState;
  onChange: (patch: Partial<WorkspaceSettingsState>) => void;
  onSave: () => void;
}

function WorkspaceTab({ state, onChange, onSave }: WorkspaceTabProps) {
  const toggleConnector = (id: string, enabled: boolean) => {
    const next = state.connectors.map((conn) =>
      conn.id === id ? { ...conn, enabled } : conn,
    );
    onChange({ connectors: next });
  };

  const addConnector = () => {
    toast.info("Connector gallery will let you add new sources soon.");
  };

  const updateHistory = (days: number) => {
    if (Number.isNaN(days) || days < 1) return;
    onChange({ keepHistoryDays: days });
  };

  const triggerDigest = () => {
    toast.success(
      "Workspace digest queued. It will summarise your day in under 1,000 words.",
    );
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Left: connectors + modes */}
      <div className="space-y-5">
        {/* Connectors */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <header className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Workspace connectors
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                Where Workspace pulls content from
              </h3>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
                Toggle connections on or off. Zora will only analyse data from
                sources that are enabled here.
              </p>
            </div>
            <button
              type="button"
              onClick={addConnector}
              className="btn btn-ghost btn-neo btn-quiet rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand"
            >
              <PlugZap className="size-4" /> Add connector
            </button>
          </header>

          <ul className="mt-4 space-y-2 text-sm">
            {state.connectors.map((conn) => (
              <li
                key={conn.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.96)] px-3 py-2.5"
              >
                <div>
                  <p className="font-semibold text-[rgb(var(--text))]">
                    {conn.name}
                  </p>
                  <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                    {conn.description}
                  </p>
                </div>
                <IOSwitch
                  checked={conn.enabled}
                  onCheckedChange={(checked) =>
                    toggleConnector(conn.id, checked)
                  }
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Modes & data */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Modes & data
            </p>
            <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
              How Workspace behaves day to day
            </h3>
          </header>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Study mode
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Tightens citations and slows Zora down slightly for more
                  careful answers.
                </dd>
              </div>
              <IOSwitch
                checked={state.studyMode}
                onCheckedChange={(checked) => onChange({ studyMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Auto-clean old data
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Automatically archive older workspace sessions past your
                  retention window.
                </dd>
              </div>
              <IOSwitch
                checked={state.autoCleanData}
                onCheckedChange={(checked) =>
                  onChange({ autoCleanData: checked })
                }
              />
            </div>

            <div className="rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3">
              <dt className="mb-1 text-sm font-semibold text-[rgb(var(--text))]">
                Workspace history window
              </dt>
              <dd className="flex items-center gap-2 text-[11px] text-[rgba(var(--subtle),0.85)]">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={state.keepHistoryDays}
                  onChange={(event) =>
                    updateHistory(Number(event.target.value))
                  }
                  className="w-16 rounded-full border border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.98)] px-2 py-1 text-center text-[11px] text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.5)]"
                />
                <span>days of searchable history kept in Workspace.</span>
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3">
              <div>
                <dt className="font-semibold text-[rgb(var(--text))]">
                  Daily workspace digest
                </dt>
                <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                  Get a short report of what you searched, what you skipped, and
                  how tomorrow could be better (max ~1,000 words).
                </dd>
              </div>
              <div className="flex flex-col items-end gap-1">
                <IOSwitch
                  checked={state.digestEnabled}
                  onCheckedChange={(checked) =>
                    onChange({ digestEnabled: checked })
                  }
                />
                <button
                  type="button"
                  onClick={triggerDigest}
                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-brand"
                >
                  <Activity className="size-3" />
                  Run test digest
                </button>
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Right: workspace custom instructions */}
      <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Workspace custom instructions
          </p>
          <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
            Tell Workspace what “good output” looks like.
          </h3>
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
            This focuses on study, projects, and documents — how you want
            flashcards, summaries, and plans to look.
          </p>
        </header>

        <textarea
          value={state.customInstructions}
          onChange={(event) =>
            onChange({ customInstructions: event.target.value })
          }
          rows={12}
          placeholder="Example: “Use spaced-repetition style flashcards, highlight definitions, and keep answer keys hidden unless I say 'reveal'.”"
          className="mt-4 w-full resize-none rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.98)] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.5)]"
        />

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            <Save className="size-4" /> Save workspace settings
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Command Center tab                                                         */
/* -------------------------------------------------------------------------- */

interface CommandCenterTabProps {
  state: CommandCenterSettingsState;
  onChange: (patch: Partial<CommandCenterSettingsState>) => void;
  onSave: () => void;
}

function CommandCenterTab({
  state,
  onChange,
  onSave,
}: CommandCenterTabProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Behaviour */}
      <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Command Center
          </p>
          <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
            What the Command Center shows by default
          </h3>
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
            These switches control which widgets appear when you open the green
            Command Center orb in the header.
          </p>
        </header>

        <dl className="mt-4 space-y-3 text-sm">
          <ToggleRow
            title="Projects"
            description="Keep active Zora projects pinned at the top of Command Center."
            checked={state.showProjects}
            onChange={(checked) => onChange({ showProjects: checked })}
          />
          <ToggleRow
            title="Upcoming"
            description="Show your upcoming sessions, reminders, or workspace tasks."
            checked={state.showUpcoming}
            onChange={(checked) => onChange({ showUpcoming: checked })}
          />
          <ToggleRow
            title="Research signals"
            description="Display signals from connectors like GitHub, LMS, and file
            systems."
            checked={state.showResearchSignals}
            onChange={(checked) => onChange({ showResearchSignals: checked })}
          />
          <ToggleRow
            title="Connector tray"
            description="Quick access to turn sources on or off without leaving the
            Command Center."
            checked={state.showConnectorsTray}
            onChange={(checked) => onChange({ showConnectorsTray: checked })}
          />
          <ToggleRow
            title="Focus timer"
            description="Show a simple focus / break timer at the bottom of the
            drawer."
            checked={state.showFocusTimer}
            onChange={(checked) => onChange({ showFocusTimer: checked })}
          />
          <ToggleRow
            title="Warn before closing"
            description="Ask for confirmation if open tasks or timers are still
            running."
            checked={state.warnOnExit}
            onChange={(checked) => onChange({ warnOnExit: checked })}
          />
        </dl>
      </div>

      {/* Layout settings */}
      <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Layout
          </p>
          <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
            How dense Command Center feels
          </h3>
        </header>

        <div className="mt-4 rounded-2xl border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.98)] p-4 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.85)]">
            Card density
          </p>
          <div className="mt-2 flex gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => onChange({ compactCards: false })}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                state.compactCards
                  ? "bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)]"
                  : "bg-[rgba(var(--brand),0.2)] text-brand"
              }`}
            >
              Spacious
            </button>
            <button
              type="button"
              onClick={() => onChange({ compactCards: true })}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                state.compactCards
                  ? "bg-[rgba(var(--brand),0.2)] text-brand"
                  : "bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)]"
              }`}
            >
              Compact
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
            Zora remembers this per device, so your Command Center can feel
            dense on desktop and calmer on tablet.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
          >
            <Save className="size-4" /> Save Command Center settings
          </button>
        </div>
      </div>
    </section>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3">
      <div>
        <dt className="font-semibold text-[rgb(var(--text))]">{title}</dt>
        <dd className="text-[11px] text-[rgba(var(--subtle),0.8)]">
          {description}
        </dd>
      </div>
      <IOSwitch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Privacy & Security tab                                                     */
/* -------------------------------------------------------------------------- */

interface PrivacyTabProps {
  state: PrivacySettingsState;
  onChange: (patch: Partial<PrivacySettingsState>) => void;
  onSave: () => void;
}

function PrivacyTab({ state, onChange, onSave }: PrivacyTabProps) {
  const changeLevel = (level: TelemetryLevel) => {
    onChange({ telemetryLevel: level });
  };

  const changeRetention = (days: number) => {
    if (Number.isNaN(days) || days < 1) return;
    onChange({ dataRetentionDays: days });
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Left: telemetry & data */}
      <div className="space-y-5">
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <header className="flex items-center gap-2">
            <Shield className="size-5 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Telemetry (opt-in)
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                Help Zora — and models — get smarter safely
              </h3>
            </div>
          </header>

          <p className="mt-2 text-xs text-[rgba(var(--subtle),0.82)]">
            When telemetry is on, we log anonymised behaviour signals —
            hallucinations, conflict between engines, and API reliability —
            never raw secrets. Aggregated data may be shared with model
            providers to improve accuracy and safety, and may generate revenue
            that keeps Zora sustainable.
          </p>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3 text-sm">
            <div>
              <p className="font-semibold text-[rgb(var(--text))]">
                Share anonymised telemetry
              </p>
              <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                You can turn this off at any time. It never includes plaintext
                passwords, IDs, or file contents.
              </p>
            </div>
            <IOSwitch
              checked={state.telemetryEnabled}
              onCheckedChange={(checked) =>
                onChange({ telemetryEnabled: checked })
              }
            />
          </div>

          <div className="mt-3 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] p-4 text-[11px]">
            <p className="mb-2 font-semibold text-[rgb(var(--text))]">
              Telemetry level
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: "minimal",
                  label: "Minimal",
                  desc: "Only basic error + uptime stats.",
                },
                {
                  id: "standard",
                  label: "Standard",
                  desc: "Add anonymised patterns and model disagreements.",
                },
                {
                  id: "full",
                  label: "Full",
                  desc: "Include prompt shapes and workflow paths (no secrets).",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => changeLevel(option.id as TelemetryLevel)}
                  className={`flex-1 rounded-2xl border px-3 py-2 text-left transition ${
                    state.telemetryLevel === option.id
                      ? "border-[rgba(var(--brand),0.6)] bg-[rgba(var(--brand),0.18)] text-brand"
                      : "border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.96)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {option.label}
                  </p>
                  <p className="mt-1 text-[11px]">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <ToggleRow
              title="Anonymise identifiers"
              description="Strip names, emails, and IDs from telemetry whenever possible."
              checked={state.anonymise}
              onChange={(checked) => onChange({ anonymise: checked })}
            />
            <ToggleRow
              title="Include Workspace signals"
              description="Allow study / project workflows to shape model-quality reports."
              checked={state.includeWorkspaceSignals}
              onChange={(checked) =>
                onChange({ includeWorkspaceSignals: checked })
              }
            />
            <ToggleRow
              title="Include Command Center signals"
              description="Share aggregated usage patterns from the Command Center."
              checked={state.includeCommandSignals}
              onChange={(checked) =>
                onChange({ includeCommandSignals: checked })
              }
            />
            <ToggleRow
              title="Safe search layer"
              description="Keep filters for self-harm, abuse, and illegal content always on."
              checked={state.safeSearch}
              onChange={(checked) => onChange({ safeSearch: checked })}
            />
          </div>

          <div className="mt-3 rounded-[18px] border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.96)] px-4 py-3 text-[11px]">
            <p className="mb-1 font-semibold text-[rgb(var(--text))]">
              Data retention for logs
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={365}
                value={state.dataRetentionDays}
                onChange={(event) =>
                  changeRetention(Number(event.target.value))
                }
                className="w-16 rounded-full border border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.98)] px-2 py-1 text-center text-[11px] text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.5)]"
              />
              <span>
                days. Shorter windows mean less telemetry kept, longer windows
                mean better trend analysis.
              </span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-[rgba(var(--subtle),0.8)]">
            A full, human-readable explanation of how telemetry works will live
            in the{" "}
            <a
              href="https://example.com/zora-telemetry"
              target="_blank"
              rel="noreferrer"
              className="text-brand underline-offset-2 hover:underline"
            >
              Zora Telemetry Guide
            </a>{" "}
            once published.
          </p>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]"
            >
              <Save className="size-4" /> Save privacy settings
            </button>
          </div>
        </div>
      </div>

      {/* Right: support & sources */}
      <div className="space-y-5">
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
          <header className="flex items-center gap-2">
            <Brain className="size-5 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Safety resources
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                If something feels heavy or unsafe
              </h3>
            </div>
          </header>
          <p className="mt-2 text-xs text-[rgba(var(--subtle),0.82)]">
            Zora can help you reason about hard situations, but it&apos;s not a
            crisis service. If you or someone else may be in danger, contact a
            real person right away.
          </p>

          <ul className="mt-3 space-y-2 text-[11px] text-[rgba(var(--subtle),0.9)]">
            <li className="flex items-start gap-2">
              <Link2 className="mt-0.5 size-3.5 text-brand" />
              <span>
                In the United States you can reach the{" "}
                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  988 Suicide &amp; Crisis Lifeline
                </a>{" "}
                24/7 by calling or texting <strong>988</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Link2 className="mt-0.5 size-3.5 text-brand" />
              <span>
                For concerns about abuse or violence, the{" "}
                <a
                  href="https://www.thehotline.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline-offset-2 hover:underline"
                >
                  National Domestic Violence Hotline
                </a>{" "}
                is available at <strong>1-800-799-SAFE</strong> in the U.S.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Link2 className="mt-0.5 size-3.5 text-brand" />
              <span>
                If you or someone else is in immediate danger, contact your
                local emergency number (for example,{" "}
                <strong>911 in the U.S.</strong>) right away.
              </span>
            </li>
          </ul>

          <p className="mt-3 text-[11px] text-[rgba(var(--subtle),0.8)]">
            For other regions, you can find helplines through organisations like{" "}
            <a
              href="https://www.opencounseling.com/suicide-hotlines"
              target="_blank"
              rel="noreferrer"
              className="text-brand underline-offset-2 hover:underline"
            >
              OpenCounseling&apos;s international helpline directory
            </a>
            .
          </p>
        </div>

        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
          <header className="flex items-center gap-2">
            <Database className="size-5 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
                Sources & logs
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                Where privacy-critical data lives
              </h3>
            </div>
          </header>
          <ul className="mt-3 space-y-2 text-[11px] text-[rgba(var(--subtle),0.9)]">
            <li>
              • Chats and workspace content live in your connected storage (for
              example: Drive, OneDrive, or your own database).
            </li>
            <li>
              • Logs and telemetry live in encrypted storage (for example:
              CloudWatch / Bedrock logs) with the retention window you set.
            </li>
            <li>
              • Zora never sells raw personal data. Aggregated, anonymised
              telemetry may be used to improve engines and fund the product.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Settings;
