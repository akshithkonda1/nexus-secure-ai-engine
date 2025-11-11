import React from "react";
import {
  CheckCircle2,
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
import { useTheme } from "@/theme/useTheme";
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

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  const handleProviderToggle = (id: string, enabled: boolean) => {
    if (!data) return;
    const updatedProviders = data.providers.map((provider) =>
      provider.id === id ? { ...provider, enabled } : provider,
    );
    saveSettings
      .mutateAsync(createPayload(data, { providers: updatedProviders }))
      .then(() => toast.success("Provider preference saved."))
      .catch(() => toast.error("Unable to update provider preferences."));
  };

  const handleApplyTheme = () => {
    if (!data) return;
    setTheme(data.appearance.theme);
    toast.success(`Applied ${data.appearance.theme} theme for this device.`);
  };

  const handleRetentionUpdate = () => {
    if (!data) return;
    const next = createPayload(data, {
      limits: {
        ...data.limits,
        dailyRequests: data.limits.dailyRequests,
        maxTokens: data.limits.maxTokens,
      },
    });
    saveSettings
      .mutateAsync(next)
      .then(() => toast.success("Workspace retention saved."))
      .catch(() => toast.error("Could not save retention preferences."));
  };

  if (isLoading) {
    return (
      <div className="px-[var(--page-padding)] py-6">
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="panel panel--glassy panel--hover panel--immersive panel--alive">
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

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="grid gap-5 lg:grid-cols-3">
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
                  "Profile editing opens once the backend issues the endpoint.",
                )
              }
            >
              <SlidersHorizontal className="size-4" /> Edit profile
            </button>
            <button
              type="button"
              className="btn btn-primary btn-neo ripple rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
              onClick={handleApplyTheme}
            >
              <CheckCircle2 className="size-4" /> Apply theme
            </button>
          </div>
        </div>

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
            onClick={handleRetentionUpdate}
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
    </div>
  );
}

export default Settings;
