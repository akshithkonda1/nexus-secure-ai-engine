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

      {/* Security providers */}
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
              Toggle integrations as you wire Zora to production-grade safety
              systems.
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
                onCheckedChange={(checked) =>
                  onProviderToggle(provider.id, checked)
                }
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
  return (
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
  );
}

function CommandCenterSettingsPanel() {
  return (
    <section className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
      <SectionHeader
        title="Command Center layout"
        description="Shape your Command Center so it feels like a cockpit, not clutter. These options will plug into the Command Center drawer as it evolves."
      />

      <div className="space-y-3 text-sm">
        <SettingRow
          title="Default layout"
          description="Choose how the Command Center arranges projects, upcoming items, and signals."
        >
          <select className="rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-xs text-[rgb(var(--text))] focus:border-[rgba(var(--brand),0.45)] focus:outline-none">
            <option>Projects · Upcoming · Signals</option>
            <option>Signals · Projects · Connectors</option>
            <option>Minimal (projects only)</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Pinned widgets"
          description="Widgets that always appear in the Command Center drawer. Configurable in a future release."
        >
          <div className="flex flex-wrap gap-1.5 justify-end text-[11px]">
            <span className="rounded-full bg-[rgba(var(--brand),0.16)] px-3 py-1 font-semibold text-brand">
              Projects
            </span>
            <span className="rounded-full bg-[rgba(var(--border),0.9)] px-3 py-1 font-semibold text-[rgba(var(--subtle),0.9)]">
              Upcoming
            </span>
            <span className="rounded-full bg-[rgba(var(--border),0.9)] px-3 py-1 font-semibold text-[rgba(var(--subtle),0.9)]">
              Signals
            </span>
            <span className="rounded-full bg-[rgba(var(--border),0.9)] px-3 py-1 font-semibold text-[rgba(var(--subtle),0.9)]">
              Connectors
            </span>
          </div>
        </SettingRow>

        <SettingRow
          title="Connectors & integrations"
          description="Control which tools can feed data into Zora and how they sync. This will link into the Command Center connectors view."
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.95)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.4)]"
          >
            Manage connectors
            <ChevronRight className="size-3.5" />
          </button>
        </SettingRow>
      </div>
    </section>
  );
}

function PrivacySettingsPanel({
  data,
  onTelemetryToggle,
  onRetentionChange,
  isSaving,
}: {
  data: SettingsData;
  onTelemetryToggle: (enabled: boolean) => void;
  onRetentionChange: (days: number) => void;
  isSaving: boolean;
}) {
  const telemetryOptIn = data.privacy?.telemetryOptIn ?? false;
  const retentionDays = data.privacy?.retentionDays ?? 90;

  return (
    <section className="space-y-5">
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
              onChange={(event) =>
                onRetentionChange(Number(event.target.value))
              }
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
                onCheckedChange={onTelemetryToggle}
                disabled={isSaving}
              />
              <p className="text-[10px] text-[rgba(var(--subtle),0.7)]">
                Details live in the Zora Handbook → Telemetry section.
              </p>
            </div>
          </SettingRow>
        </div>
      </div>

      <div className="panel panel--glassy panel--alive rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] p-6 shadow-[var(--shadow-soft)]">
        <SectionHeader
          title="Your data, your exit plan"
          description="Export or delete everything tied to your account. These actions will eventually become one-click once wired to the backend."
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
            Zora never sells your personal data. If you enable opt-in telemetry,
            Zora may share anonymized model performance analytics with providers
            to improve reliability—never your actual content.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN SETTINGS                                                              */
/* -------------------------------------------------------------------------- */

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("zora");

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

  if (!data) {
    return null;
  }

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
      "Usage limits saved.",
      "Could not save usage limits.",
    );
  };

  const handleTelemetryToggle = (enabled: boolean) => {
    const nextPrivacy = {
      ...(data.privacy ?? {}),
      telemetryOptIn: enabled,
    };
    updateSettings(
      { privacy: nextPrivacy },
      enabled ? "Opt-in telemetry enabled." : "Opt-in telemetry disabled.",
      "Unable to update telemetry preferences.",
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
          <PrivacySettingsPanel
            data={data}
            onTelemetryToggle={handleTelemetryToggle}
            onRetentionChange={handleRetentionChange}
            isSaving={saveSettings.isPending}
          />
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
          Global Zora behavior, Workspace usage, Command Center layout, and
          privacy controls are all grouped into simple sections. No hunting
          through pages of toggles.
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
