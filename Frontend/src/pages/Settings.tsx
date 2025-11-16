import React from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  Loader2,
  RefreshCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings, useSaveSettings } from "@/queries/settings";
import type { SettingsData } from "@/types/models";
import { Switch } from "@/shared/ui/components/switch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import SkeletonBlock from "@/components/SkeletonBlock";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
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

type ProviderSettings = SettingsData["providers"][number] & {
  rank?: number;
};

const FALLBACK_PROVIDERS: ProviderSettings[] = [
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

function getRankedProviders(raw: ProviderSettings[] | undefined): ProviderSettings[] {
  const base = raw && raw.length ? raw : FALLBACK_PROVIDERS;
  return [...base]
    .map((p, index) => ({ ...p, rank: p.rank ?? index + 1 }))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
}

/* -------------------------------------------------------------------------- */
/* Settings page                                                              */
/* -------------------------------------------------------------------------- */

export function Settings() {
  const { setTheme } = useTheme();
  const { data, isLoading, isError, refetch } = useSettings();
  const saveSettings = useSaveSettings();

  const handleProviderToggle = (id: string, enabled: boolean) => {
    if (!data) return;

    const current = getRankedProviders(data.providers);
    const updatedProviders = current.map((provider) =>
      provider.id === id ? { ...provider, enabled } : provider,
    );

    saveSettings
      .mutateAsync(createPayload(data, { providers: updatedProviders }))
      .then(() => toast.success("Engine availability updated."))
      .catch(() => toast.error("Unable to update engine availability."));
  };

  const handleEngineReorder = (index: number, direction: "up" | "down") => {
    if (!data) return;

    const current = getRankedProviders(data.providers);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= current.length) return;

    const next = [...current];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);

    const ranked = next.map((provider, idx) => ({
      ...provider,
      rank: idx + 1,
    }));

    saveSettings
      .mutateAsync(createPayload(data, { providers: ranked }))
      .then(() => toast.success("Engine ranking saved."))
      .catch(() => toast.error("Unable to update engine ranking."));
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

  /* ---------------------------------------------------------------------- */
  /* Loading / error                                                        */
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

  const rankedProviders = getRankedProviders(data.providers);

  /* ---------------------------------------------------------------------- */
  /* Main layout                                                            */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Workspace identity ------------------------------------------------ */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="accent-ink text-base font-semibold text-[rgb(var(--text))]">
                Workspace identity
              </h3>
              <p className="text-sm text-[rgba(var(--subtle),0.78)]">
                Profile and appearance controls for Zora.
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

        {/* Rank your engines ------------------------------------------------- */}
        <div className="panel panel--glassy panel--hover panel--immersive panel--alive card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.72)]">
                Engine guardrails
              </p>
              <h3 className="accent-ink mt-1 text-base font-semibold text-[rgb(var(--text))]">
                Rank your engines
              </h3>
              <p className="mt-1 text-sm text-[rgba(var(--subtle),0.78)]">
                Set your preferred model order. Zora will try the highest-ranked
                available engine first when multiple options can answer a
                request.
              </p>
            </div>
            {saveSettings.isPending && (
              <Loader2
                className="size-4 animate-spin text-brand"
                aria-hidden="true"
              />
            )}
          </div>

          <ul className="mt-4 space-y-3">
            {rankedProviders.map((provider, index) => {
              const isFirst = index === 0;
              const isLast = index === rankedProviders.length - 1;

              return (
                <li
                  key={provider.id}
                  className="panel panel--glassy panel--hover panel--immersive panel--alive flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.55)] px-3 py-3 text-sm"
                >
                  {/* LEFT: grip + name */}
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
                          {provider.name}
                        </p>
                        {isFirst && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.14)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                            <Star className="size-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[rgba(var(--subtle),0.78)]">
                        Used as {isFirst ? "primary" : "fallback"} engine when
                        enabled.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: rank controls + toggle */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEngineReorder(index, "up")}
                        disabled={isFirst || saveSettings.isPending}
                        className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                          isFirst
                            ? "cursor-default border-[rgba(var(--border),0.4)] text-[rgba(var(--subtle),0.6)]"
                            : "border-[rgba(var(--border),0.5)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-brand"
                        }`}
                        aria-label="Move engine up"
                      >
                        <ArrowUp className="mr-1 size-3" />
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEngineReorder(index, "down")}
                        disabled={isLast || saveSettings.isPending}
                        className={`inline-flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                          isLast
                            ? "cursor-default border-[rgba(var(--border),0.4)] text-[rgba(var(--subtle),0.6)]"
                            : "border-[rgba(var(--border),0.5)] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-brand"
                        }`}
                        aria-label="Move engine down"
                      >
                        <ArrowDown className="mr-1 size-3" />
                        Down
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[rgba(var(--subtle),0.8)]">
                      <span>{provider.enabled ? "Enabled" : "Disabled"}</span>
                      <Switch
                        checked={provider.enabled}
                        onCheckedChange={(checked) =>
                          handleProviderToggle(provider.id, checked)
                        }
                        disabled={saveSettings.isPending}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Usage & retention ------------------------------------------------- */}
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
