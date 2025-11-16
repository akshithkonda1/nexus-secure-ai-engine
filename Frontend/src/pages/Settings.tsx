import React, { useState } from "react";
import {
  Bell,
  Brain,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  Info,
  LayoutDashboard,
  Loader2,
  RefreshCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { Switch } from "@/shared/ui/components/switch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";

/* -------------------------------------------------------------------------- */
/* HELPERS & TYPES                                                            */
/* -------------------------------------------------------------------------- */

function createPayload(
  settings: SettingsData,
  overrides: Partial<SettingsData>,
): SettingsData {
  return {
    ...settings,
    ...overrides,
  };
}

type SettingsTabId = "zora" | "workspace" | "command" | "privacy";

const tabs: { id: SettingsTabId; label: string; icon: React.ComponentType<any> }[] = [
  { id: "zora", label: "Zora", icon: Brain },
  { id: "workspace", label: "Workspace", icon: FolderKanban },
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "privacy", label: "Privacy & Info", icon: ShieldCheck },
];

const RETENTION_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days (recommended)", value: 90 },
  { label: "365 days", value: 365 },
  { label: "Forever (manual delete only)", value: 0 },
];

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-[rgb(var(--text))]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-xs text-[rgba(var(--subtle),0.8)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.6)] px-4 py-3 text-sm text-[rgb(var(--text))] sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <p className="font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="sm:text-right">{children}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TELEMETRY CONSENT MODAL                                                    */
/* -------------------------------------------------------------------------- */

function TelemetryConsentModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.55)] backdrop-blur-sm">
      <div className="panel panel--glassy panel--alive max-w-lg rounded-[26px] border border-[rgba(var(--border),0.8)] bg-[rgba(var(--surface),0.98)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.75)]">
            Telemetry consent
          </p>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-[rgb(var(--text))]">
          Share anonymized telemetry with Zora?
        </h2>
        <p className="mt-2 text-sm text-[rgba(var(--subtle),0.85)]">
          Opting in lets Zora learn from patterns, not from the raw content of your
          chats. We use these signals to make model debate more accurate, improve
          Workspace intelligence, and tune Command Center signals.
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-[rgba(var(--subtle),0.85)]">
          <li>• We record model performance, error types, and latency.</li>
          <li>• We do not store full prompts or documents as telemetry.</li>
          <li>• We may share anonymized performance stats with model providers.</li>
          <li>• You can turn this off anytime from Settings.</li>
        </ul>
        <p className="mt-3 text-[11px] text-[rgba(var(--subtle),0.75)]">
          This is optional. Zora works fine with telemetry off—opt in if you want to
          help improve accuracy and reliability over time.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-neo btn-quiet rounded-full px-4 py-2 uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.85)] hover:text-brand"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 uppercase tracking-[0.2em]"
          >
            Enable telemetry
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TAB PANELS                                                                 */
/* -------------------------------------------------------------------------- */

function ZoraSettingsPanel({
  data,
  onApplyTheme,
  onProviderToggle,
  isSaving,
}: {
  data: SettingsData;
  onApplyTheme: () => void;
  onProviderToggle: (id: string, enabled: boolean) => void;
  isSaving: boolean;
}) {
  const [explanationStyle, setExplanationStyle] = useState<"brief" | "standard" | "detailed">(
    "standard",
  );
  const [safetyMode, setSafetyMode] = useState<"relaxed" | "balanced" | "strict">("balanced");
  const [notificationLevel, setNotificationLevel] = useState<"all" | "important" | "minimal">(
    "important",
  );
  const [commandHints, setCommandHints] = useState(true);
  const [autoContinue, setAutoContinue] = useState(false);
  const [debugInfo, setDebugInfo] = useState(false);
  const [interfaceLanguage, setInterfaceLanguage] = useState("System default");

  return (
    <div className="space-y-5">
      {/* Account & appearance */}
      <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.72)]">
              Account & appearance
            </p>
            <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
              Workspace identity
            </h3>
            <p className="mt-1 text-sm text-[rgba(var(--subtle),0.78)]">
              Profile and appearance controls for Zora on this account.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.14)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
            <ShieldCheck className="size-3.5" /> Verified
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
              toast.info(
                "Profile editing opens once the backend exposes the endpoint.",
              )
            }
          >
            <SlidersHorizontal className="size-4" /> Edit profile
          </button>
          <button
            type="button"
            className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
            onClick={onApplyTheme}
          >
            <CheckCircle2 className="size-4" /> Apply theme
          </button>
        </div>
      </section>

      {/* Zora behavior: 6 settings */}
      <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)] space-y-3">
        <SectionHeader
          title="Zora behavior"
          description="Tune how Zora talks, explains, and reacts across the entire app."
        />

        <SettingRow
          title="Explanation style"
          description="Choose how deep Zora goes when it explains reasoning and model debates."
        >
          <div className="inline-flex gap-2 rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.9)] p-1 text-[11px]">
            {["brief", "standard", "detailed"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setExplanationStyle(mode as typeof explanationStyle);
                  toast.success("Explanation style updated (wired soon).");
                }}
                className={`rounded-full px-3 py-1 font-semibold capitalize ${
                  explanationStyle === mode
                    ? "bg-[rgba(var(--brand),0.12)] text-brand"
                    : "text-[rgba(var(--subtle),0.9)] hover:bg-[rgba(var(--panel),0.9)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          title="Safety strictness"
          description="Control how cautious Zora should be with harmful, sensitive, or ambiguous content."
        >
          <div className="inline-flex gap-2 text-[11px]">
            {[
              { label: "Relaxed", value: "relaxed" },
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSafetyMode(option.value as typeof safetyMode);
                  toast.success("Safety strictness updated (wired soon).");
                }}
                className={`rounded-full border px-3 py-1 font-semibold ${
                  safetyMode === option.value
                    ? "border-[rgba(var(--brand),0.6)] bg-[rgba(var(--brand),0.12)] text-brand"
                    : "border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          title="Notification level"
          description="Tell Zora how noisy it’s allowed to be with tips, alerts, and system messages."
        >
          <div className="inline-flex gap-2 text-[11px]">
            {[
              { label: "All activity", value: "all" },
              { label: "Important only", value: "important" },
              { label: "Minimal", value: "minimal" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setNotificationLevel(option.value as typeof notificationLevel);
                  toast.success("Notification level updated (wired soon).");
                }}
                className={`rounded-full border px-3 py-1 font-semibold ${
                  notificationLevel === option.value
                    ? "border-[rgba(var(--brand),0.6)] bg-[rgba(var(--brand),0.12)] text-brand"
                    : "border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow
          title="Command hints & shortcuts"
          description="Let Zora surface hints and quick-actions based on what you’re doing."
        >
          <div className="flex flex-col items-end gap-1">
            <Switch
              checked={commandHints}
              onCheckedChange={(checked) => {
                setCommandHints(checked);
                toast.success("Command hints preference saved locally (wiring next).");
              }}
            />
            <p className="text-[10px] text-[rgba(var(--subtle),0.7)]">
              Will connect to the recommendation system as Command Center matures.
            </p>
          </div>
        </SettingRow>

        <SettingRow
          title="Auto-continue long tasks"
          description="Allow Zora to keep running long operations (like research or summarization) without asking every time."
        >
          <Switch
            checked={autoContinue}
            onCheckedChange={(checked) => {
              setAutoContinue(checked);
              toast.success("Auto-continue preference updated (wired soon).");
            }}
          />
        </SettingRow>

        <SettingRow
          title="Show advanced debug details"
          description="Expose extra technical details (model names, tokens, latency) for advanced users."
        >
          <Switch
            checked={debugInfo}
            onCheckedChange={(checked) => {
              setDebugInfo(checked);
              toast.success("Debug visibility updated (wired soon).");
            }}
          />
        </SettingRow>

        <SettingRow
          title="Interface language"
          description="Choose the language Zora uses for UI copy. Responses can still be in any language."
        >
          <select
            className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
            value={interfaceLanguage}
            onChange={(event) => {
              setInterfaceLanguage(event.target.value);
              toast.success("Language preference saved locally (wiring next).");
            }}
          >
            <option>System default</option>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
          </select>
        </SettingRow>
      </section>

      {/* Security providers (existing wiring) */}
      <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.72)]">
              Engine guardrails
            </p>
            <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
              Security providers
            </h3>
            <p className="mt-1 text-sm text-[rgba(var(--subtle),0.78)]">
              Toggle integrations as you wire Zora to production-grade safety systems.
            </p>
          </div>
          {isSaving && (
            <Loader2
              className="size-4 animate-spin text-brand"
              aria-hidden="true"
            />
          )}
        </div>

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
                onCheckedChange={(checked) => onProviderToggle(provider.id, checked)}
                disabled={isSaving}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function WorkspaceSettingsPanel({
  data,
  onSaveLimits,
  isSaving,
}: {
  data: SettingsData;
  onSaveLimits: () => void;
  isSaving: boolean;
}) {
  const [defaultView, setDefaultView] = useState("Recent items");
  const [autoFlashcards, setAutoFlashcards] = useState(true);
  const [smartOrg, setSmartOrg] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [workspaceHints, setWorkspaceHints] = useState(true);

  return (
    <div className="space-y-5">
      {/* Workspace behavior: 5 settings */}
      <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Workspace behavior"
          description="Control how Workspace organizes your notes, documents, and study material."
        />

        <div className="space-y-3 text-sm">
          <SettingRow
            title="Default Workspace view"
            description="Choose what you see first when you open Workspace."
          >
            <select
              className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
              value={defaultView}
              onChange={(event) => {
                setDefaultView(event.target.value);
                toast.success("Default view updated (wiring next).");
              }}
            >
              <option>Recent items</option>
              <option>Projects</option>
              <option>Flashcards</option>
              <option>All documents</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Auto-generate flashcards"
            description="Let Workspace quietly turn long documents and chats into verified flashcard decks."
          >
            <Switch
              checked={autoFlashcards}
              onCheckedChange={(checked) => {
                setAutoFlashcards(checked);
                toast.success("Flashcard automation preference updated (wiring next).");
              }}
            />
          </SettingRow>

          <SettingRow
            title="Smart organization"
            description="Allow Workspace to auto-tag and group content by topic, course, or project."
          >
            <Switch
              checked={smartOrg}
              onCheckedChange={(checked) => {
                setSmartOrg(checked);
                toast.success("Smart organization preference updated (wiring next).");
              }}
            />
          </SettingRow>

          <SettingRow
            title="Show completed items"
            description="Keep completed tasks and archived items visible in context instead of hiding them."
          >
            <Switch
              checked={showCompleted}
              onCheckedChange={(checked) => {
                setShowCompleted(checked);
                toast.success("Visibility preference updated (wiring next).");
              }}
            />
          </SettingRow>

          <SettingRow
            title="Workspace hints"
            description="Surface subtle hints for organizing, summarizing, or turning content into study material."
          >
            <Switch
              checked={workspaceHints}
              onCheckedChange={(checked) => {
                setWorkspaceHints(checked);
                toast.success("Workspace hints preference updated (wiring next).");
              }}
            />
          </SettingRow>
        </div>
      </section>

      {/* Usage & limits (existing wiring, 2 settings) */}
      <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Workspace usage & limits"
          description="Align Workspace rate limits with your compliance requirements before go-live."
        />

        <dl className="mt-2 space-y-3 text-sm">
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
          onClick={onSaveLimits}
          className="mt-5 btn btn-ghost btn-neo btn-quiet text-brand text-xs uppercase tracking-[0.2em]"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}{" "}
          Save limits
        </button>
      </section>
    </div>
  );
}

function CommandCenterSettingsPanel() {
  const [layout, setLayout] = useState("Projects · Upcoming · Signals");
  const [pinnedProjects, setPinnedProjects] = useState(true);
  const [pinnedUpcoming, setPinnedUpcoming] = useState(true);
  const [pinnedSignals, setPinnedSignals] = useState(false);
  const [pinnedConnectors, setPinnedConnectors] = useState(false);
  const [projectSort, setProjectSort] = useState("Recent activity");
  const [lookaheadDays, setLookaheadDays] = useState(7);
  const [commandPalette, setCommandPalette] = useState(true);

  return (
    <section className="space-y-5">
      <div className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Command Center layout"
          description="Shape your Command Center so it feels like a cockpit, not clutter."
        />

        <div className="space-y-3 text-sm">
          <SettingRow
            title="Default layout"
            description="Choose how the Command Center arranges projects, upcoming items, and signals."
          >
            <select
              className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
              value={layout}
              onChange={(event) => {
                setLayout(event.target.value);
                toast.success("Command Center layout saved locally (wiring next).");
              }}
            >
              <option>Projects · Upcoming · Signals</option>
              <option>Signals · Projects · Connectors</option>
              <option>Minimal (projects only)</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Pinned widgets"
            description="Widgets that always appear in the Command Center drawer."
          >
            <div className="flex flex-wrap gap-1.5 justify-end text-[11px]">
              <button
                type="button"
                onClick={() => setPinnedProjects((v) => !v)}
                className={`rounded-full px-3 py-1 font-semibold ${
                  pinnedProjects
                    ? "bg-[rgba(var(--brand),0.16)] text-brand"
                    : "bg-[rgba(var(--border),0.9)] text-[rgba(var(--subtle),0.9)]"
                }`}
              >
                Projects
              </button>
              <button
                type="button"
                onClick={() => setPinnedUpcoming((v) => !v)}
                className={`rounded-full px-3 py-1 font-semibold ${
                  pinnedUpcoming
                    ? "bg-[rgba(var(--brand),0.16)] text-brand"
                    : "bg-[rgba(var(--border),0.9)] text-[rgba(var(--subtle),0.9)]"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setPinnedSignals((v) => !v)}
                className={`rounded-full px-3 py-1 font-semibold ${
                  pinnedSignals
                    ? "bg-[rgba(var(--brand),0.16)] text-brand"
                    : "bg-[rgba(var(--border),0.9)] text-[rgba(var(--subtle),0.9)]"
                }`}
              >
                Signals
              </button>
              <button
                type="button"
                onClick={() => setPinnedConnectors((v) => !v)}
                className={`rounded-full px-3 py-1 font-semibold ${
                  pinnedConnectors
                    ? "bg-[rgba(var(--brand),0.16)] text-brand"
                    : "bg-[rgba(var(--border),0.9)] text-[rgba(var(--subtle),0.9)]"
                }`}
              >
                Connectors
              </button>
            </div>
          </SettingRow>

          <SettingRow
            title="Project sort order"
            description="Pick how projects are ordered by default inside Command Center."
          >
            <select
              className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
              value={projectSort}
              onChange={(event) => {
                setProjectSort(event.target.value);
                toast.success("Project sort order saved locally (wiring next).");
              }}
            >
              <option>Recent activity</option>
              <option>Nearest deadlines</option>
              <option>Manual priority</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Upcoming lookahead window"
            description="How far into the future Command Center should scan for upcoming tasks."
          >
            <select
              className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
              value={lookaheadDays}
              onChange={(event) => {
                const val = Number(event.target.value);
                setLookaheadDays(val);
                toast.success("Lookahead window updated (wiring next).");
              }}
            >
              <option value={3}>Next 3 days</option>
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Command palette access"
            description="Enable a keyboard shortcut for Command Center (like Ctrl/Cmd + K)."
          >
            <Switch
              checked={commandPalette}
              onCheckedChange={(checked) => {
                setCommandPalette(checked);
                toast.success("Command palette preference updated (wiring next).");
              }}
            />
          </SettingRow>

          <SettingRow
            title="Connectors & integrations"
            description="Control which tools can feed data into Zora and how they sync."
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
              onClick={() =>
                toast.info("Connectors management will link into Command Center soon.")
              }
            >
              Manage connectors
              <ChevronRight className="size-3.5" />
            </button>
          </SettingRow>

          <SettingRow
            title="Signals aggressiveness"
            description="Decide how proactive Command Center should be about surfacing signals and suggestions."
          >
            <div className="inline-flex gap-2 text-[11px]">
              {["Low", "Medium", "High"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    toast.success(
                      `Signals aggressiveness set to ${level} (wiring next).`,
                    )
                  }
                  className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1 font-semibold text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
                >
                  {level}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </div>
    </section>
  );
}

function PrivacySettingsPanel({
  data,
  telemetryOptIn,
  isSaving,
  onTelemetrySwitchRequested,
  onRetentionChange,
  onOpenTelemetryModal,
}: {
  data: SettingsData;
  telemetryOptIn: boolean;
  isSaving: boolean;
  onTelemetrySwitchRequested: (enabled: boolean) => void;
  onRetentionChange: (days: number) => void;
  onOpenTelemetryModal: () => void;
}) {
  const retentionDays = data.privacy?.retentionDays ?? 90;

  return (
    <section className="space-y-5">
      {/* Privacy & telemetry (2 settings) */}
      <div className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Privacy & telemetry"
          description="Control how long Zora remembers your data and whether anonymized telemetry is used to improve the system."
        />

        <div className="space-y-3 text-sm">
          <SettingRow
            title="Data retention window"
            description="Choose how long Zora keeps your chats, Workspace content, and Command Center state before automatic deletion."
          >
            <select
              className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
              value={retentionDays}
              onChange={(event) => onRetentionChange(Number(event.target.value))}
              disabled={isSaving}
            >
              {RETENTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            title="Opt-in telemetry"
            description="Allow Zora to use anonymized performance signals (not your content) to improve accuracy, Workspace intelligence, and Command Center insights."
          >
            <div className="flex flex-col items-end gap-1">
              <Switch
                checked={telemetryOptIn}
                onCheckedChange={(enabled) => onTelemetrySwitchRequested(enabled)}
                disabled={isSaving}
              />
              <button
                type="button"
                onClick={onOpenTelemetryModal}
                className="text-[10px] font-semibold text-brand underline-offset-2 hover:underline"
              >
                View telemetry details
              </button>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Data control (3 settings) */}
      <div className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Your data, your exit plan"
          description="Export or delete everything tied to your account. These actions will be wired to backend flows before launch."
        />

        <div className="space-y-3 text-sm">
          <SettingRow
            title="Export your data"
            description="Request a portable export of your Zora data so you can take your work elsewhere anytime."
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
              onClick={() =>
                toast.info(
                  "Data export will be available once the backend endpoint is live.",
                )
              }
            >
              <ShieldCheck className="size-3.5" />
              Request export
            </button>
          </SettingRow>

          <SettingRow
            title="Session timeout"
            description="Set how long Zora can stay signed in on this device before requiring you to log in again."
          >
            <select
              className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none"
              onChange={(event) =>
                toast.success(
                  `Session timeout updated to ${event.target.value} (wiring next).`,
                )
              }
            >
              <option>1 hour</option>
              <option>8 hours</option>
              <option>24 hours</option>
              <option>7 days</option>
            </select>
          </SettingRow>

          <SettingRow
            title="Mask personal info in logs"
            description="Automatically mask names, emails, and IDs from diagnostic logs where possible."
          >
            <Switch
              checked
              onCheckedChange={() =>
                toast.success("Log masking preference updated (wiring next).")
              }
            />
          </SettingRow>

          <SettingRow
            title="Delete account"
            description="Permanently delete your account and all associated data across Zora, Workspace, and Command Center."
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--status-critical),0.6)] bg-[rgba(var(--status-critical),0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--status-critical))] hover:bg-[rgba(var(--status-critical),0.12)]"
              onClick={() =>
                toast.info(
                  "Account deletion will be wired to a dedicated flow before launch.",
                )
              }
            >
              Delete everything
            </button>
          </SettingRow>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.85)] px-4 py-3 text-[11px] text-[rgba(var(--subtle),0.85)]">
          <Info className="mt-0.5 size-3.5 text-brand" />
          <p>
            Zora never sells your personal data. If you enable opt-in telemetry, Zora
            may share anonymized model performance analytics with providers to improve
            reliability—never your actual content.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN SETTINGS COMPONENT                                                    */
/* -------------------------------------------------------------------------- */

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("zora");
  const [showTelemetryConsent, setShowTelemetryConsent] = useState(false);

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

  const telemetryOptIn = data.privacy?.telemetryOptIn ?? false;

  const updateSettings = (
    overrides: Partial<SettingsData>,
    successMessage?: string,
    errorMessage?: string,
  ) => {
    return saveSettings
      .mutateAsync(createPayload(data, overrides))
      .then(() => {
        if (successMessage) toast.success(successMessage);
      })
      .catch(() => {
        if (errorMessage) toast.error(errorMessage);
      });
  };

  const handleProviderToggle = (id: string, enabled: boolean) => {
    const updatedProviders = data.providers.map((provider) =>
      provider.id === id ? { ...provider, enabled } : provider,
    );
    updateSettings(
      { providers: updatedProviders },
      "Provider preference saved.",
      "Unable to update provider preferences.",
    );
  };

  const handleApplyTheme = () => {
    setTheme(data.appearance.theme);
    toast.success(`Applied ${data.appearance.theme} theme for this device.`);
  };

  const handleLimitsSave = () => {
    updateSettings(
      { limits: data.limits },
      "Workspace usage limits saved.",
      "Could not save usage limits.",
    );
  };

  const handleRetentionChange = (days: number) => {
    const nextPrivacy = {
      ...(data.privacy ?? {}),
      retentionDays: days,
    };
    updateSettings(
      { privacy: nextPrivacy },
      "Retention preference saved.",
      "Unable to update retention preferences.",
    );
  };

  // When user flips the telemetry switch:
  // - turning ON -> show consent modal
  // - turning OFF -> immediately disable
  const handleTelemetrySwitchRequested = (enabled: boolean) => {
    if (enabled && !telemetryOptIn) {
      setShowTelemetryConsent(true);
      return;
    }
    if (!enabled && telemetryOptIn) {
      const nextPrivacy = {
        ...(data.privacy ?? {}),
        telemetryOptIn: false,
      };
      updateSettings(
        { privacy: nextPrivacy },
        "Opt-in telemetry disabled.",
        "Unable to update telemetry preferences.",
      );
    }
  };

  const handleConfirmTelemetryEnable = () => {
    const nextPrivacy = {
      ...(data.privacy ?? {}),
      telemetryOptIn: true,
    };
    updateSettings(
      { privacy: nextPrivacy },
      "Opt-in telemetry enabled.",
      "Unable to update telemetry preferences.",
    ).finally(() => {
      setShowTelemetryConsent(false);
    });
  };

  const ActivePanel = (() => {
    switch (activeTab) {
      case "workspace":
        return (
          <WorkspaceSettingsPanel
            data={data}
            onSaveLimits={handleLimitsSave}
            isSaving={saveSettings.isPending}
          />
        );
      case "command":
        return <CommandCenterSettingsPanel />;
      case "privacy":
        return (
          <>
            <PrivacySettingsPanel
              data={data}
              telemetryOptIn={telemetryOptIn}
              isSaving={saveSettings.isPending}
              onTelemetrySwitchRequested={handleTelemetrySwitchRequested}
              onRetentionChange={handleRetentionChange}
              onOpenTelemetryModal={() => setShowTelemetryConsent(true)}
            />
            <TelemetryConsentModal
              open={showTelemetryConsent}
              onCancel={() => setShowTelemetryConsent(false)}
              onConfirm={handleConfirmTelemetryEnable}
            />
          </>
        );
      case "zora":
      default:
        return (
          <ZoraSettingsPanel
            data={data}
            onApplyTheme={handleApplyTheme}
            onProviderToggle={handleProviderToggle}
            isSaving={saveSettings.isPending}
          />
        );
    }
  })();

  return (
    <div className="px-[var(--page-padding)] py-6 space-y-5">
      {/* HERO */}
      <section className="panel panel--glassy panel--hover panel--immersive panel--alive panel--halo rounded-[28px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.75)]">
          Settings
        </p>
        <h1 className="text-2xl font-semibold text-[rgb(var(--text))] sm:text-3xl">
          Shape how Zora works for you.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[rgba(var(--subtle),0.8)]">
          Zora, Workspace, Command Center, and privacy controls are grouped into
          simple sections. You get a clear mental model instead of a maze of toggles.
        </p>
      </section>

      {/* TABS */}
      <nav className="flex flex-wrap gap-2 text-sm">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.65)] focus:ring-offset-1 focus:ring-offset-[rgb(var(--surface))] ${
                isActive
                  ? "border-[rgba(var(--brand),0.6)] bg-[rgba(var(--brand),0.12)] text-brand"
                  : "border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.9)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* ACTIVE PANEL */}
      <div>{ActivePanel}</div>
    </div>
  );
}

export default Settings;
