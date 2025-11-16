import React, { useEffect, useState } from "react";
import {
  Activity,
  FolderPlus,
  HelpCircle,
  Loader2,
  RefreshCcw,
  Save,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { Switch } from "@/shared/ui/components/switch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";

/**
 * We treat all new settings as a generic "preferences" blob so you can
 * evolve SettingsData later without TS getting in the way.
 */
function createPayload(settings: SettingsData, overrides: any): SettingsData {
  return {
    ...(settings as any),
    ...overrides,
  } as SettingsData;
}

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  // Early skeleton / error states
  if (isLoading) {
    return (
      <div className="px-[var(--page-padding)] py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.55)] bg-[rgba(var(--surface),0.85)] p-5"
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
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.9)] p-6 text-center text-sm text-[rgba(var(--subtle),0.85)]">
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

  // --- Preferences blob -----------------------------------------------------

  const preferences = ((data as any).preferences ?? {}) as any;

  const zoraPrefs = preferences.zora ?? {};
  const workspacePrefs = preferences.workspace ?? {};
  const telemetryPrefs = preferences.telemetry ?? {};
  const commandPrefs = preferences.commandCenter ?? {};

  const [customInstructions, setCustomInstructions] = useState<string>(
    zoraPrefs.customInstructions ?? "",
  );

  useEffect(() => {
    setCustomInstructions(zoraPrefs.customInstructions ?? "");
  }, [zoraPrefs.customInstructions]);

  const handleApplyTheme = () => {
    setTheme(data.appearance.theme);
    toast.success(`Applied ${data.appearance.theme} theme for this device.`);
  };

  const updatePreferences = async (partial: any, successMessage?: string) => {
    const nextPrefs = {
      ...preferences,
      ...partial,
    };

    const payload = createPayload(data, { preferences: nextPrefs });

    try {
      await saveSettings.mutateAsync(payload as any);
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to save settings.");
    }
  };

  // Zora behaviour toggles
  const toggleZora = (key: string, value: boolean) => {
    updatePreferences(
      {
        zora: {
          ...zoraPrefs,
          [key]: value,
        },
      },
      "Zora settings updated.",
    );
  };

  // Workspace behaviour toggles
  const toggleWorkspace = (key: string, value: boolean) => {
    updatePreferences(
      {
        workspace: {
          ...workspacePrefs,
          [key]: value,
        },
      },
      "Workspace settings updated.",
    );
  };

  // Telemetry toggles
  const toggleTelemetry = (key: string, value: boolean) => {
    updatePreferences(
      {
        telemetry: {
          ...telemetryPrefs,
          [key]: value,
        },
      },
      "Telemetry preferences updated.",
    );
  };

  // Command Center behaviour toggles
  const toggleCommandCenter = (key: string, value: boolean) => {
    updatePreferences(
      {
        commandCenter: {
          ...commandPrefs,
          [key]: value,
        },
      },
      "Command Center settings updated.",
    );
  };

  const handleSaveCustomInstructions = () => {
    updatePreferences(
      {
        zora: {
          ...zoraPrefs,
          customInstructions: customInstructions.trim(),
        },
      },
      "Custom instructions saved.",
    );
  };

  const tone = zoraPrefs.defaultTone ?? "balanced";

  const setTone = (nextTone: string) => {
    updatePreferences(
      {
        zora: {
          ...zoraPrefs,
          defaultTone: nextTone,
        },
      },
      "Default tone updated.",
    );
  };

  const telemetryEnabled = !!telemetryPrefs.enabled;

  const setTelemetryLevel = (level: "minimal" | "standard" | "full") => {
    if (!telemetryEnabled) return;
    toggleTelemetry("level", level);
  };

  const telemetryRetentionDays = telemetryPrefs.retentionDays ?? 90;

  const handleRetentionChange = (days: number) => {
    toggleTelemetry("retentionDays", days);
  };

  const isSaving = saveSettings.isPending;

  return (
    <div className="px-[var(--page-padding)] py-6 space-y-6">
      {/* Top identity / appearance row */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.92)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
                Workspace identity
              </p>
              <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
                {data.profile.displayName}
              </h2>
              <p className="text-xs text-[rgba(var(--subtle),0.78)]">
                {data.profile.email}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand-soft),0.2)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand">
              <Shield className="size-3.5" /> Verified
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              className="btn btn-ghost btn-neo btn-quiet rounded-full px-4 py-2 uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.85)] hover:text-brand"
              onClick={() =>
                toast.info(
                  "Profile editing will be available once the account service is wired.",
                )
              }
            >
              <SlidersHorizontal className="size-4" /> Edit profile
            </button>
            <button
              type="button"
              onClick={handleApplyTheme}
              className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 uppercase tracking-[0.2em]"
            >
              <Save className="size-4" /> Apply theme
            </button>
          </div>
        </div>

        {/* Usage / limits quick card */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.92)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
            Usage & retention
          </p>
          <p className="mt-1 text-sm text-[rgba(var(--subtle),0.82)]">
            These limits are mainly for infrastructure. Behaviour settings
            below handle how Zora thinks.
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="panel panel--glassy panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.55)] px-3 py-2">
              <dt className="text-[rgba(var(--subtle),0.75)]">
                Daily requests
              </dt>
              <dd className="font-semibold text-[rgb(var(--text))]">
                {data.limits.dailyRequests.toLocaleString()}
              </dd>
            </div>
            <div className="panel panel--glassy panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.55)] px-3 py-2">
              <dt className="text-[rgba(var(--subtle),0.75)]">Max tokens</dt>
              <dd className="font-semibold text-[rgb(var(--text))]">
                {data.limits.maxTokens.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Zora behaviour + Custom instructions */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)]">
        {/* Behaviour */}
        <section className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.72)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.24),_transparent)_0_0/100%_40%_no-repeat,_rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Behaviour
          </p>
          <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
            How Zora behaves by default
          </h2>
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
            These switches affect Zora everywhere: Workspace, Command Center,
            and standalone chat.
          </p>

          <div className="mt-4 space-y-3">
            {[
              {
                key: "safeMode",
                title: "Safe mode",
                description:
                  "Extra-strict filters on sensitive topics and risky suggestions.",
              },
              {
                key: "autoChooseEngine",
                title: "Auto-choose engine",
                description:
                  "Let Zora pick the best model for each request using your ranking as a bias.",
              },
              {
                key: "explainReasoning",
                title: "Explain reasoning",
                description:
                  "Ask Zora to briefly explain why it chose a model or answer path.",
              },
              {
                key: "showModelBadges",
                title: "Show model badges",
                description:
                  "Display which engine answered each message in the UI.",
              },
              {
                key: "showSystemPrompts",
                title: "Show system prompts",
                description:
                  "Allow advanced users to reveal the underlying system messages used for each run.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="panel panel--glassy panel--hover panel--alive flex items-center justify-between rounded-[22px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.9)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.8)]">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={!!zoraPrefs[item.key]}
                  onCheckedChange={(checked) =>
                    toggleZora(item.key, Boolean(checked))
                  }
                  disabled={isSaving}
                />
              </div>
            ))}
          </div>

          {/* Tone selector */}
          <div className="mt-4 rounded-[22px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.9)] px-4 py-3">
            <p className="text-sm font-semibold text-[rgb(var(--text))]">
              Default tone
            </p>
            <p className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.8)]">
              Choose the baseline style for answers. You can still ask for
              something different in a prompt.
            </p>
            <div className="mt-3 inline-flex gap-2 rounded-full bg-[rgba(var(--surface),0.9)] p-1 text-xs">
              {[
                { id: "balanced", label: "Balanced" },
                { id: "precise", label: "Precise" },
                { id: "creative", label: "Creative" },
              ].map((option) => {
                const active = tone === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTone(option.id)}
                    className={`rounded-full px-3 py-1.5 font-semibold transition ${
                      active
                        ? "bg-[rgba(var(--brand-soft),0.9)] text-[rgb(var(--on-accent))] shadow-[0_0_16px_rgba(0,140,255,0.45)]"
                        : "text-[rgba(var(--subtle),0.85)] hover:bg-[rgba(var(--border),0.35)]"
                    }`}
                    disabled={isSaving}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Custom instructions */}
        <section className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.72)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Custom instructions
          </p>
          <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
            Tell Zora how to think about you.
          </h2>
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
            Explain what matters to you, how formal you want answers to be, and
            any standing preferences. Zora compresses this behind the scenes so
            it can travel with you across Workspace and Command Center.
          </p>

          <div className="mt-3 rounded-[18px] border border-[rgba(var(--border),0.5)] bg-[rgba(var(--panel),0.95)] px-3 py-2 text-[11px] text-[rgba(var(--subtle),0.9)]">
            <p className="font-semibold text-[rgba(var(--subtle),0.95)]">
              Example
            </p>
            <p className="mt-1">
              “Always prioritise reliability over speed. I&apos;m preparing for
              long-form study, so keep a calm, encouraging tone, cite sources
              when you can, and call out key risks clearly.”
            </p>
          </div>

          <div className="mt-3 flex-1 rounded-[22px] border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.98)] p-3">
            <textarea
              value={customInstructions}
              onChange={(event) => setCustomInstructions(event.target.value)}
              placeholder="Tell Zora how you like to work. There’s no character limit."
              className="h-56 w-full resize-none rounded-[18px] border-none bg-transparent p-2 text-sm text-[rgb(var(--text))] outline-none placeholder:text-[rgba(var(--subtle),0.6)]"
            />
          </div>
          <p className="mt-2 text-[10px] text-[rgba(var(--subtle),0.8)]">
            There&apos;s no character limit here. Zora will summarise and
            compress this behind the scenes to keep responses consistent.
          </p>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveCustomInstructions}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,rgba(0,135,255,1),rgba(56,220,180,1))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--on-accent))] shadow-[0_0_26px_rgba(0,140,255,0.4)]"
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Zora settings
            </button>
          </div>
        </section>
      </section>

      {/* Workspace: connectors + modes */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.05fr)]">
        {/* Connectors */}
        <section className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.72)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.2),_transparent)_0_0/100%_40%_no-repeat,_rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Workspace connectors
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[rgb(var(--text))]">
                Where Workspace pulls content from
              </h2>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
                Toggle connections on or off. Zora will only analyse data from
                sources that are enabled here.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.info("Connector picker opens here (to be wired).")
              }
              className="btn btn-ghost btn-neo rounded-[20px] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--text))]"
            >
              <FolderPlus className="size-4" /> Add connector
            </button>
          </div>

          const connectors =
          {(workspacePrefs.connectors ??
            [
              {
                id: "google-drive",
                name: "Google Drive",
                description: "Docs, slides, and PDFs from your Google account.",
              },
              {
                id: "onedrive",
                name: "Microsoft OneDrive",
                description:
                  "Files and folders from your Microsoft 365 workspace.",
              },
              {
                id: "notion",
                name: "Notion",
                description: "Pages and databases from your Notion workspace.",
              },
              {
                id: "github",
                name: "GitHub",
                description:
                  "Repos, READMEs, and issues for coding workflows.",
              },
              {
                id: "canvas",
                name: "Canvas / LMS",
                description:
                  "Course content, assignments, and announcements.",
              },
            ]) as any[]}

          <div className="mt-4 space-y-3">
            {connectors.map((connector) => {
              const enabled =
                workspacePrefs.connectorStates?.[connector.id] ?? true;
              return (
                <div
                  key={connector.id}
                  className="panel panel--glassy panel--hover panel--alive flex items-center justify-between rounded-[22px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.95)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[rgb(var(--text))]">
                      {connector.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.8)]">
                      {connector.description}
                    </p>
                  </div>
                  <Switch
                    checked={!!enabled}
                    onCheckedChange={(checked) =>
                      toggleWorkspace("connectorStates", {
                        ...(workspacePrefs.connectorStates ?? {}),
                        [connector.id]: Boolean(checked),
                      })
                    }
                    disabled={isSaving}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Modes & data */}
        <section className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.72)] bg-[rgba(var(--surface),0.95)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
            Modes & data
          </p>
          <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
            How Workspace behaves day to day
          </h2>

          <div className="mt-4 space-y-3">
            {[
              {
                key: "studyMode",
                title: "Study mode",
                description:
                  "Tightens citations and slows Zora down slightly for more careful answers.",
              },
              {
                key: "autoClean",
                title: "Auto-clean old data",
                description:
                  "Automatically archive older Workspace sessions past your retention window.",
              },
              {
                key: "dailyDigest",
                title: "Daily Workspace digest",
                description:
                  "Email-style snapshot of what you worked on, what you skipped, and tips for tomorrow.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="panel panel--glassy panel--hover panel--alive flex items-center justify-between rounded-[22px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.95)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.8)]">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={!!workspacePrefs[item.key]}
                  onCheckedChange={(checked) =>
                    toggleWorkspace(item.key, Boolean(checked))
                  }
                  disabled={isSaving}
                />
              </div>
            ))}
          </div>

          {workspacePrefs.dailyDigest && (
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-brand underline-offset-2 hover:underline"
              onClick={() =>
                toast.info(
                  "Daily digest preview / generation to be wired to backend.",
                )
              }
            >
              <Activity className="size-3.5" /> Open latest digest preview
            </button>
          )}
        </section>
      </section>

      {/* Command Center behaviour */}
      <section className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.72)] bg-[rgba(var(--surface),0.96)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Command Center
            </p>
            <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
              How the Command Center behaves
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
              These switches control project tiles, alerts, and how strongly
              Command Center influences Zora’s decisions.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            {
              key: "projectAlerts",
              title: "Project alerts",
              description:
                "Surface high-priority projects and updates at the top of Command Center.",
            },
            {
              key: "autoPinActive",
              title: "Auto-pin active projects",
              description:
                "Automatically keep your most active projects pinned in the overview.",
            },
            {
              key: "workspaceSync",
              title: "Sync with Workspace",
              description:
                "Let Command Center pull tasks and study items directly from Workspace sessions.",
            },
            {
              key: "respectSafeMode",
              title: "Always respect Safe mode",
              description:
                "Even in Command Center, do not relax filters or guardrails.",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="panel panel--glassy panel--hover panel--alive flex items-center justify-between rounded-[22px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--panel),0.96)] px-4 py-3"
            >
              <div className="pr-3">
                <p className="text-sm font-semibold text-[rgb(var(--text))]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.8)]">
                  {item.description}
                </p>
              </div>
              <Switch
                checked={!!commandPrefs[item.key]}
                onCheckedChange={(checked) =>
                  toggleCommandCenter(item.key, Boolean(checked))
                }
                disabled={isSaving}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Telemetry & privacy */}
      <section className="panel panel--glassy panel--hover panel--immersive panel--alive rounded-[26px] border border-[rgba(var(--border),0.72)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.24),_transparent)_0_0/100%_40%_no-repeat,_rgba(var(--surface),0.97)] p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.78)]">
              Telemetry (opt-in)
            </p>
            <h2 className="mt-1 text-base font-semibold text-[rgb(var(--text))]">
              Help Zora — and models — get smarter safely
            </h2>
            <p className="mt-1 text-xs text-[rgba(var(--subtle),0.85)]">
              When telemetry is on, we log anonymised behaviour signals —
              hallucinations, conflict between engines, and API reliability —
              never raw secrets. Aggregated data may be shared with model
              providers to improve accuracy and safety, and may generate revenue
              that keeps Zora sustainable.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[rgba(var(--panel),0.95)] px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.9)]">
              Share anonymised telemetry
            </span>
            <Switch
              checked={telemetryEnabled}
              onCheckedChange={(checked) =>
                toggleTelemetry("enabled", Boolean(checked))
              }
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Telemetry level */}
        <div
          className={`mt-4 rounded-[22px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.97)] px-4 py-3 ${
            !telemetryEnabled ? "opacity-60" : ""
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.9)]">
            Telemetry level
          </p>
          <div className="mt-2 inline-flex flex-wrap gap-2 text-[11px]">
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
            ].map((level) => {
              const active = telemetryPrefs.level ?? "standard";
              const selected = active === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() =>
                    setTelemetryLevel(level.id as "minimal" | "standard" | "full")
                  }
                  disabled={!telemetryEnabled || isSaving}
                  className={`flex min-w-[140px] flex-col rounded-[18px] px-3 py-2 text-left transition ${
                    selected
                      ? "bg-[rgba(var(--brand-soft),0.95)] text-[rgb(var(--on-accent))] shadow-[0_0_22px_rgba(0,140,255,0.45)]"
                      : "bg-[rgba(var(--surface),0.9)] text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--border),0.35)]"
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {level.label}
                  </span>
                  <span className="mt-1 text-[10px] opacity-90">
                    {level.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry switches */}
        <div
          className={`mt-4 grid gap-3 md:grid-cols-2 ${
            !telemetryEnabled ? "opacity-60" : ""
          }`}
        >
          {[
            {
              key: "anonymiseIds",
              title: "Anonymise identifiers",
              description:
                "Strip names, emails, and IDs from telemetry whenever possible.",
            },
            {
              key: "workspaceSignals",
              title: "Include Workspace signals",
              description:
                "Allow study / project workflows to shape model-quality reports.",
            },
            {
              key: "commandSignals",
              title: "Include Command Center signals",
              description:
                "Share aggregated usage patterns from the Command Center.",
            },
            {
              key: "safeSearchLayer",
              title: "Safe search layer",
              description:
                "Keep filters for self-harm, abuse, and illegal content always on.",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="panel panel--glassy panel--hover panel--alive flex items-center justify-between rounded-[22px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.97)] px-4 py-3"
            >
              <div className="pr-3">
                <p className="text-sm font-semibold text-[rgb(var(--text))]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[rgba(var(--subtle),0.85)]">
                  {item.description}
                </p>
              </div>
              <Switch
                checked={!!telemetryPrefs[item.key]}
                onCheckedChange={(checked) =>
                  toggleTelemetry(item.key, Boolean(checked))
                }
                disabled={!telemetryEnabled || isSaving}
              />
            </div>
          ))}
        </div>

        {/* Retention slider */}
        <div
          className={`mt-4 rounded-[22px] border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.97)] px-4 py-3 ${
            !telemetryEnabled ? "opacity-60" : ""
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.9)]">
            Data retention for logs
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              type="range"
              min={7}
              max={365}
              step={1}
              value={telemetryRetentionDays}
              onChange={(event) =>
                handleRetentionChange(Number(event.target.value))
              }
              disabled={!telemetryEnabled || isSaving}
              className="h-1 w-full max-w-xs cursor-pointer rounded-full bg-[rgba(var(--border),0.5)] accent-[rgb(var(--brand))]"
            />
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--surface),0.9)] px-3 py-1 text-[11px] font-semibold text-[rgb(var(--text))]">
              {telemetryRetentionDays} days
            </span>
          </div>
          <p className="mt-1 text-[10px] text-[rgba(var(--subtle),0.8)]">
            Shorter windows mean less telemetry kept; longer windows mean better
            trend analysis. This never includes plaintext passwords or file
            contents.
          </p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[rgba(var(--subtle),0.9)] underline-offset-2 hover:underline"
            onClick={() =>
              window.open(
                "https://988lifeline.org/",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <HelpCircle className="size-3.5" />
            Learn about safety, crisis hotlines, and abuse reporting
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;
