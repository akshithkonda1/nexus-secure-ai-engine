// src/pages/Settings.tsx
import React, { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { Switch } from "@/shared/ui/components/switch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";

type SettingsTab = "zora" | "workspace" | "command" | "privacy";

function buildPayload(
  current: SettingsData,
  overrides: Partial<SettingsData>,
): SettingsData {
  return {
    ...current,
    ...overrides,
  };
}

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  // --------- LOCAL UI STATE (hooks FIRST, always) ----------
  const [activeTab, setActiveTab] = useState<SettingsTab>("zora");

  const [zoraCustomInstructions, setZoraCustomInstructions] = useState("");
  const [workspaceCustomInstructions, setWorkspaceCustomInstructions] =
    useState("");

  // telemetry consent sheet (can be expanded later)
  const [showTelemetryConsent, setShowTelemetryConsent] = useState(false);

  // --------- SAFE DERIVED PREFS (work even while loading) ----------
  const preferences = ((data as any)?.preferences ?? {}) as any;

  const zoraPrefs = preferences.zora ?? {};
  const workspacePrefs = preferences.workspace ?? {};
  const commandPrefs = preferences.commandCenter ?? {};
  const privacyPrefs = preferences.privacy ?? {};

  const connectors =
    (data as any)?.connectors ??
    [
      {
        id: "google-drive",
        name: "Google Drive",
        description:
          "Docs, slides, and PDFs from your Google account.",
        enabled: true,
      },
      {
        id: "onedrive",
        name: "Microsoft OneDrive",
        description:
          "Files and folders from your Microsoft 365 workspace.",
        enabled: true,
      },
      {
        id: "notion",
        name: "Notion",
        description: "Pages and databases from your Notion workspace.",
        enabled: true,
      },
      {
        id: "github",
        name: "GitHub",
        description: "Repos, READMEs, and issues for coding workflows.",
        enabled: true,
      },
      {
        id: "canvas",
        name: "Canvas / LMS",
        description: "Course content, assignments, and announcements.",
        enabled: true,
      },
    ];

  // --------- SYNC TEXTAREAS WHEN SETTINGS ARRIVE ----------
  useEffect(() => {
    if (typeof zoraPrefs.customInstructions === "string") {
      setZoraCustomInstructions(zoraPrefs.customInstructions);
    }
    if (typeof workspacePrefs.customInstructions === "string") {
      setWorkspaceCustomInstructions(workspacePrefs.customInstructions);
    }
  }, [zoraPrefs.customInstructions, workspacePrefs.customInstructions]);

  // --------- HELPERS TO SAVE SETTINGS ----------
  const persistSettings = async (
    overrides: Partial<SettingsData>,
    successMessage: string,
  ) => {
    if (!data) return;
    try {
      await saveSettings.mutateAsync(buildPayload(data, overrides));
      toast.success(successMessage);
    } catch {
      toast.error("We couldn’t save those settings. Try again in a bit.");
    }
  };

  const persistPreferences = async (nextPrefs: any, successMessage: string) => {
    if (!data) return;
    const overrides: Partial<SettingsData> = {
      ...(data as any),
      preferences: {
        ...preferences,
        ...nextPrefs,
      },
    };
    try {
      await saveSettings.mutateAsync(overrides as SettingsData);
      toast.success(successMessage);
    } catch {
      toast.error("We couldn’t save those preferences just now.");
    }
  };

  const handleThemeApply = () => {
    if (!data) return;
    setTheme(data.appearance.theme);
    toast.success(`Applied ${data.appearance.theme} theme on this device.`);
  };

  const handleProviderToggle = (id: string, enabled: boolean) => {
    if (!data) return;
    const updatedProviders = data.providers.map((provider) =>
      provider.id === id ? { ...provider, enabled } : provider,
    );
    persistSettings(
      { providers: updatedProviders },
      "Security provider preference saved.",
    );
  };

  const handleZoraToggle = (key: string, value: boolean | string) => {
    const next = {
      zora: {
        ...zoraPrefs,
        [key]: value,
      },
    };
    persistPreferences(next, "Zora behaviour updated.");
  };

  const handleWorkspaceToggle = (key: string, value: boolean | string) => {
    const next = {
      workspace: {
        ...workspacePrefs,
        [key]: value,
      },
    };
    persistPreferences(next, "Workspace settings updated.");
  };

  const handleCommandToggle = (key: string, value: boolean) => {
    const next = {
      commandCenter: {
        ...commandPrefs,
        [key]: value,
      },
    };
    persistPreferences(next, "Command Center behaviour updated.");
  };

  const handlePrivacyToggle = (key: string, value: boolean | number | string) => {
    const next = {
      privacy: {
        ...privacyPrefs,
        [key]: value,
      },
    };
    persistPreferences(next, "Privacy & telemetry settings updated.");
  };

  const handleConnectorToggle = (id: string, enabled: boolean) => {
    const updated = connectors.map((c: any) =>
      c.id === id ? { ...c, enabled } : c,
    );
    persistSettings(
      { ...(data as any), connectors: updated } as Partial<SettingsData>,
      "Workspace connector updated.",
    );
  };

  const handleGenerateDigest = () => {
    toast.info(
      "Daily Workspace digest will summarise what you searched, skipped, and what to focus on tomorrow (max 1000 words).",
    );
  };

  const handleSaveCustomInstructions = async () => {
    const next = {
      zora: {
        ...zoraPrefs,
        customInstructions: zoraCustomInstructions,
      },
      workspace: {
        ...workspacePrefs,
        customInstructions: workspaceCustomInstructions,
      },
    };
    await persistPreferences(next, "Custom instructions saved.");
  };

  // --------- LOADING / ERROR STATES (after all hooks) ----------
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

  // ============================================================
  // MAIN UI
  // ============================================================
  return (
    <div className="px-[var(--page-padding)] py-6">
      {/* Tabs header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.75)]">
          <Activity className="size-4" />
          <span>Settings</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: "zora", label: "Zora" },
            { id: "workspace", label: "Workspace" },
            { id: "command", label: "Command Center" },
            { id: "privacy", label: "Privacy & security" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`rounded-full border px-3 py-1.5 transition text-xs font-semibold ${
                activeTab === tab.id
                  ? "border-[rgba(var(--brand),0.7)] bg-[rgba(var(--brand),0.16)] text-brand"
                  : "border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.45)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* ZORA TAB                                                         */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === "zora" && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]">
          {/* Behaviour + switches */}
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.8)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
              Behaviour
            </p>
            <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
              How Zora behaves by default
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
              These switches affect Zora everywhere: Workspace, Command Center,
              and standalone chat.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              {/* each row: label + description + iPhone switch */}
              <SettingRow
                title="Safe mode"
                description="Extra-strict filters on sensitive topics and risky suggestions."
                checked={!!zoraPrefs.safeMode}
                onChange={(value) => handleZoraToggle("safeMode", value)}
              />
              <SettingRow
                title="Auto-choose engine"
                description="Let Zora pick the best model for each request using your ranking as a bias."
                checked={!!zoraPrefs.autoChooseEngine}
                onChange={(value) =>
                  handleZoraToggle("autoChooseEngine", value)
                }
              />
              <SettingRow
                title="Explain reasoning"
                description="Ask Zora to briefly explain why it chose a model or answer path."
                checked={!!zoraPrefs.explainReasoning}
                onChange={(value) =>
                  handleZoraToggle("explainReasoning", value)
                }
              />
              <SettingRow
                title="Show model badges"
                description="Display which engine answered each message in the UI."
                checked={!!zoraPrefs.showModelBadges}
                onChange={(value) =>
                  handleZoraToggle("showModelBadges", value)
                }
              />
              <SettingRow
                title="Show system prompts"
                description="Allow advanced users to reveal the underlying system messages used for each run."
                checked={!!zoraPrefs.showSystemPrompts}
                onChange={(value) =>
                  handleZoraToggle("showSystemPrompts", value)
                }
              />
            </div>

            {/* Default tone toggle group */}
            <div className="mt-4 rounded-[20px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.7)] px-4 py-3 text-xs">
              <p className="font-semibold text-[rgb(var(--text))]">
                Default tone
              </p>
              <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
                Zora can bias answers toward balanced, precise, or creative
                responses by default.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["balanced", "precise", "creative"].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleZoraToggle("defaultTone", tone)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition ${
                      zoraPrefs.defaultTone === tone
                        ? "bg-[rgba(var(--brand),0.2)] text-brand"
                        : "bg-[rgba(var(--panel),0.9)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.35)]"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom instructions card */}
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.8)] bg-[rgba(var(--surface),0.98)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
              Custom instructions
            </p>
            <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
              Tell Zora how to think about you.
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
              Explain what matters to you, how formal you like answers to be,
              and any standing preferences. Zora compresses this behind the
              scenes so it can travel with you across Workspace and Command
              Center.
            </p>

            <div className="mt-3 space-y-2 rounded-[20px] border border-[rgba(var(--border),0.5)] bg-[rgba(var(--panel),0.9)] p-3 text-[11px] text-[rgba(var(--subtle),0.86)]">
              <p className="font-semibold text-[rgb(var(--text))]">Example</p>
              <p>
                “Always prioritise reliability over speed. I&apos;m preparing
                for long-form study, so keep a calm, encouraging tone, cite
                sources when you can, and call out key risks clearly.”
              </p>
            </div>

            <div className="mt-4">
              <textarea
                rows={8}
                className="w-full resize-none rounded-[20px] border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.95)] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.7)]"
                placeholder="Tell Zora how you like to work. There’s no character limit."
                value={zoraCustomInstructions}
                onChange={(e) => setZoraCustomInstructions(e.target.value)}
              />
              <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
                There&apos;s no character limit here. Zora will summarise and
                compress this behind the scenes to keep responses consistent.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCustomInstructions}
                className="btn btn-primary btn-neo ripple inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em]"
              >
                <CheckCircle2 className="size-4" />
                Save Zora settings
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* WORKSPACE TAB                                                    */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === "workspace" && (
        <section className="mt-2 space-y-5">
          {/* Connectors */}
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.85)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
                  Workspace connectors
                </p>
                <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
                  Where Workspace pulls content from
                </h2>
                <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
                  Toggle connections on or off. Zora will only analyse data from
                  sources that are enabled here.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-neo btn-quiet rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand"
                onClick={() =>
                  toast.info(
                    "Connector catalogue will open here once wiring is complete.",
                  )
                }
              >
                <Activity className="size-4" /> Add connector
              </button>
            </div>

            <ul className="mt-4 space-y-3">
              {connectors.map((connector: any) => (
                <li
                  key={connector.id}
                  className="flex items-center justify-between rounded-[20px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.9)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--text))]">
                      {connector.name}
                    </p>
                    <p className="text-[11px] text-[rgba(var(--subtle),0.8)]">
                      {connector.description}
                    </p>
                  </div>
                  <Switch
                    checked={!!connector.enabled}
                    onCheckedChange={(checked) =>
                      handleConnectorToggle(connector.id, checked)
                    }
                    disabled={saveSettings.isPending}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Modes & data */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.85)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
                Modes & data
              </p>
              <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
                How Workspace behaves day to day
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <SettingRow
                  title="Study mode"
                  description="Tightens citations and slows Zora down slightly for more careful answers."
                  checked={!!workspacePrefs.studyMode}
                  onChange={(value) =>
                    handleWorkspaceToggle("studyMode", value)
                  }
                />
                <SettingRow
                  title="Auto-clean old data"
                  description="Automatically archive older Workspace sessions past your retention window."
                  checked={!!workspacePrefs.autoCleanData}
                  onChange={(value) =>
                    handleWorkspaceToggle("autoCleanData", value)
                  }
                />
              </div>

              <div className="mt-4 rounded-[20px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.85)] px-4 py-3 text-[11px]">
                <p className="mb-2 text-xs font-semibold text-[rgb(var(--text))]">
                  Daily Workspace digest
                </p>
                <p className="text-[rgba(var(--subtle),0.85)]">
                  Generate a short, 1000-word max report of what you searched,
                  ignored, and what to focus on tomorrow.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateDigest}
                  className="mt-3 text-xs font-semibold text-brand underline underline-offset-4"
                >
                  Generate today&apos;s digest
                </button>
              </div>
            </div>

            {/* Workspace custom instructions */}
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.85)] bg-[rgba(var(--surface),0.98)] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
                Workspace instructions
              </p>
              <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
                Tell Zora how to handle study & projects
              </h2>
              <textarea
                rows={7}
                className="mt-3 w-full resize-none rounded-[20px] border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.95)] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgba(var(--brand),0.7)]"
                placeholder="Describe how you’d like Workspace to organise notes, flashcards, and project boards."
                value={workspaceCustomInstructions}
                onChange={(e) => setWorkspaceCustomInstructions(e.target.value)}
              />
              <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
                These instructions stay inside Workspace. Zora still respects
                your main preferences from the Zora tab.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* COMMAND CENTER TAB (behaviour switches only for now)             */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === "command" && (
        <section className="mt-2 space-y-5">
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.85)] bg-[rgba(var(--surface),0.97)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
              Command Center
            </p>
            <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
              How the Command Center behaves
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
              These switches control how the Command Center surfaces projects,
              signals, and integrations.
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <SettingRow
                title="Show project cards"
                description="Always show your active projects when you open the Command Center."
                checked={!!commandPrefs.showProjects}
                onChange={(value) =>
                  handleCommandToggle("showProjects", value)
                }
              />
              <SettingRow
                title="Show upcoming timeline"
                description="Surface upcoming deadlines and events in the Command Center."
                checked={!!commandPrefs.showUpcoming}
                onChange={(value) =>
                  handleCommandToggle("showUpcoming", value)
                }
              />
              <SettingRow
                title="Show research signals"
                description="Show research-style feeds from your connected tools."
                checked={!!commandPrefs.showSignals}
                onChange={(value) =>
                  handleCommandToggle("showSignals", value)
                }
              />
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* PRIVACY & SECURITY TAB (TELEMETRY + SAFE SEARCH)                 */}
      {/* ---------------------------------------------------------------- */}
      {activeTab === "privacy" && (
        <section className="mt-2 space-y-5">
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.85)] bg-[rgba(var(--surface),0.97)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
                  Telemetry (opt-in)
                </p>
                <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
                  Help Zora — and models — get smarter safely
                </h2>
              </div>
            </div>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
              When telemetry is on, we log anonymised behaviour signals—
              hallucinations, conflict between engines, and API reliability—
              never raw secrets. Aggregated data may be shared with model
              providers to improve accuracy and safety, and may generate
              revenue that keeps Zora sustainable.
            </p>

            {/* master telemetry switch */}
            <div className="mt-4">
              <SettingRow
                title="Share anonymised telemetry"
                description="You can turn this off at any time. It never includes plaintext passwords, IDs, or file contents."
                checked={!!privacyPrefs.telemetryEnabled}
                onChange={(value) => {
                  handlePrivacyToggle("telemetryEnabled", value);
                  if (value && !privacyPrefs.telemetrySeenConsent) {
                    setShowTelemetryConsent(true);
                  }
                }}
              />
            </div>

            {/* level */}
            <div className="mt-4 rounded-[20px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.9)] px-4 py-3 text-xs">
              <p className="font-semibold text-[rgb(var(--text))]">
                Telemetry level
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  {
                    id: "minimal",
                    label: "Minimal",
                    description: "Only basic error + uptime stats.",
                  },
                  {
                    id: "standard",
                    label: "Standard",
                    description: "Add anonymised patterns and model disagreements.",
                  },
                  {
                    id: "full",
                    label: "Full",
                    description:
                      "Include prompt shapes and workflow paths (no secrets).",
                  },
                ].map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    disabled={!privacyPrefs.telemetryEnabled}
                    onClick={() =>
                      handlePrivacyToggle("telemetryLevel", level.id)
                    }
                    className={`flex-1 min-w-[120px] rounded-2xl px-3 py-2 text-left text-[11px] transition ${
                      privacyPrefs.telemetryLevel === level.id
                        ? "bg-[rgba(var(--brand),0.25)] text-brand"
                        : "bg-[rgba(var(--surface),0.9)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.35)] disabled:opacity-60"
                    }`}
                  >
                    <p className="font-semibold">{level.label}</p>
                    <p className="mt-1 text-[10px] text-[rgba(var(--subtle),0.88)]">
                      {level.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* sub-switches */}
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
              <SettingRow
                title="Anonymise identifiers"
                description="Strip names, emails, and IDs from telemetry whenever possible."
                checked={!!privacyPrefs.anonymiseIdentifiers}
                onChange={(value) =>
                  handlePrivacyToggle("anonymiseIdentifiers", value)
                }
                disabled={!privacyPrefs.telemetryEnabled}
              />
              <SettingRow
                title="Include Workspace signals"
                description="Allow study / project workflows to shape model-quality reports."
                checked={!!privacyPrefs.includeWorkspaceSignals}
                onChange={(value) =>
                  handlePrivacyToggle("includeWorkspaceSignals", value)
                }
                disabled={!privacyPrefs.telemetryEnabled}
              />
              <SettingRow
                title="Include Command Center signals"
                description="Share aggregated usage patterns from the Command Center."
                checked={!!privacyPrefs.includeCommandSignals}
                onChange={(value) =>
                  handlePrivacyToggle("includeCommandSignals", value)
                }
                disabled={!privacyPrefs.telemetryEnabled}
              />
              <SettingRow
                title="Safe search layer"
                description="Keep filters for self-harm, abuse, and illegal content always on."
                checked={
                  privacyPrefs.safeSearchLayer !== false // default true
                }
                onChange={(value) =>
                  handlePrivacyToggle("safeSearchLayer", value)
                }
              />
            </div>

            {/* hotline links */}
            <div className="mt-4 rounded-[20px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.9)] px-4 py-3 text-[11px] text-[rgba(var(--subtle),0.9)]">
              <p className="mb-1 text-xs font-semibold text-[rgb(var(--text))]">
                If you&apos;re in crisis
              </p>
              <p>
                Zora is not a crisis service. If you or someone else is in
                danger, call{" "}
                <a
                  href="tel:911"
                  className="font-semibold text-brand underline underline-offset-2"
                >
                  911
                </a>{" "}
                in the U.S. or your local emergency number.
              </p>
              <p className="mt-1">
                For support with self-harm or suicidal thoughts in the U.S.,
                you can call or text{" "}
                <a
                  href="tel:988"
                  className="font-semibold text-brand underline underline-offset-2"
                >
                  988
                </a>{" "}
                (Suicide & Crisis Lifeline). For abuse or assault, consider
                reaching out to local hotlines or national resources such as
                the{" "}
                <a
                  href="https://www.thehotline.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand underline underline-offset-2"
                >
                  National Domestic Violence Hotline
                </a>{" "}
                or{" "}
                <a
                  href="https://www.rainn.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand underline underline-offset-2"
                >
                  RAINN
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      )}

      {/* simple existing identity + provider cards stay below, if you want them */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Workspace identity / theme */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
                Workspace identity
              </h3>
              <p className="text-sm text-[rgba(var(--subtle),0.78)]">
                Profile and appearance controls for Nexus.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.14)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
              <CheckCircle2 className="size-3.5" /> Verified
            </span>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[rgba(var(--subtle),0.7)]">Display name</dt>
              <dd className="text-[rgb(var(--text))]">
                {data.profile.displayName}
              </dd>
            </div>
            <div>
              <dt className="text-[rgba(var(--subtle),0.7)]">Email</dt>
              <dd className="text-[rgb(var(--text))]">{data.profile.email}</dd>
            </div>
            <div>
              <dt className="text-[rgba(var(--subtle),0.7)]">Theme</dt>
              <dd className="text-[rgb(var(--text))] capitalize">
                {data.appearance.theme}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-neo btn-quiet rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.85)] hover:text-brand"
              onClick={() =>
                toast.info("Profile editing will be wired in a later build.")
              }
            >
              <SlidersHorizontal className="size-4" /> Edit profile
            </button>
            <button
              type="button"
              className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
              onClick={handleThemeApply}
            >
              <CheckCircle2 className="size-4" /> Apply theme
            </button>
          </div>
        </div>

        {/* Providers */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5">
          <div className="flex items-center justify-between">
            <h3 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
              Security providers
            </h3>
            {saveSettings.isPending && (
              <Loader2
                className="size-4 animate-spin text-brand"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="mt-1 text-sm text-[rgba(var(--subtle),0.78)]">
            Toggle integrations as you wire Nexus to production guardrails.
          </p>
          <ul className="mt-4 space-y-3">
            {data.providers.map((provider) => (
              <li
                key={provider.id}
                className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.55)] p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {provider.name}
                  </p>
                  <p className="text-xs text-[rgba(var(--subtle),0.7)]">
                    {provider.enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={(checked) =>
                    handleProviderToggle(provider.id, checked)
                  }
                  disabled={saveSettings.isPending}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Limits */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5">
          <h3 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
            Usage & retention
          </h3>
          <p className="mt-1 text-sm text-[rgba(var(--subtle),0.78)]">
            Align rate limits with your compliance requirements before go-live.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] p-3">
              <dt className="text-[rgba(var(--subtle),0.7)]">Daily requests</dt>
              <dd className="text-[rgb(var(--text))]">
                {data.limits.dailyRequests.toLocaleString()}
              </dd>
            </div>
            <div className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] p-3">
              <dt className="text-[rgba(var(--subtle),0.7)]">Max tokens</dt>
              <dd className="text-[rgb(var(--text))]">
                {data.limits.maxTokens.toLocaleString()}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() =>
              persistSettings(
                {
                  limits: {
                    ...data.limits,
                  },
                },
                "Workspace retention saved.",
              )
            }
            className="mt-5 btn btn-ghost btn-neo btn-quiet text-brand text-xs uppercase tracking-[0.2em]"
            disabled={saveSettings.isPending}
          >
            {saveSettings.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}{" "}
            Save limits
          </button>
        </div>
      </div>

      {/* simple consent dialog shell */}
      {showTelemetryConsent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
          <div className="panel panel--glassy panel--immersive panel--alive rounded-[24px] border border-[rgba(var(--border),0.85)] bg-[rgba(var(--surface),0.98)] p-6 shadow-[var(--shadow-soft)] max-w-lg">
            <h2 className="text-base font-semibold text-[rgb(var(--text))]">
              Thanks for opting in to telemetry
            </h2>
            <p className="mt-2 text-sm text-[rgba(var(--subtle),0.85)]">
              Zora will only log anonymised behaviour signals. Never paste
              passwords, full IDs, or anything you wouldn&apos;t share with a
              cautious coworker. You can turn telemetry off at any time in this
              tab.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-neo btn-quiet text-xs uppercase tracking-[0.2em]"
                onClick={() => setShowTelemetryConsent(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generic row with title + description + iOS-style Switch
 */
type SettingRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-[rgb(var(--text))]">
          {title}
        </p>
        <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.8)]">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default Settings;
