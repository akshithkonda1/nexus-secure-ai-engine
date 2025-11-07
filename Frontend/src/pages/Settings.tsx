import React, { useEffect } from "react";
import { useForm, type UseFormSetValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Settings as SettingsIcon, SunMedium } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useSaveSettings, useSettings } from "@/queries/settings";
import { SettingsResponse, type SettingsData } from "@/types/models";
import { toast } from "sonner";
import { useTheme, type ThemePref } from "@/theme/useTheme";

function ThemeControl({
  saved,
  setValue,
}: {
  saved?: ThemePref;
  setValue: UseFormSetValue<SettingsData>;
}) {
  const { pref, setPref } = useTheme();
  const choose = (next: ThemePref) => {
    setPref(next);
    setValue("appearance.theme", next, { shouldDirty: next !== saved });
  };

  const options: { id: ThemePref; label: string }[] = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "System" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => choose(opt.id)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            pref === opt.id ? "border-primary bg-primary/20 text-white" : "border-white/10 bg-surface/70 text-muted hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const saveSettings = useSaveSettings();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<SettingsData>({
    resolver: zodResolver(SettingsResponse),
    defaultValues: data,
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);
  useEffect(() => {
    register("appearance.theme");
  }, [register]);

  const savedTheme = data?.appearance?.theme as ThemePref | undefined;

  const onSubmit = async (values: SettingsData) => {
    const result = await saveSettings.mutateAsync(values).catch(() => undefined);
    if (result?.success) toast.success("Settings saved");
    else toast.error("Failed to save settings");
  };

  return (
    <div className="space-y-8 text-white">
      <PageHeader
        title="Settings"
        description="Manage profile details, appearance, providers, and Nexus guardrails from a single control center."
        actions={
          <button
            type="submit"
            form="settings-form"
            disabled={!isDirty || isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 bg-white/5" />
          <Skeleton className="h-52 bg-white/5" />
          <Skeleton className="h-48 bg-white/5" />
        </div>
      ) : data ? (
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">Profile</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Update how your teammates see you across Nexus.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Display name
                <input
                  {...register("profile.displayName")}
                  className="rounded-lg border border-white/10 bg-surface/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                {errors.profile?.displayName ? (
                  <span className="text-xs text-red-400">{errors.profile.displayName.message}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-sm text-muted">
                Email
                <input
                  {...register("profile.email")}
                  type="email"
                  className="rounded-lg border border-white/10 bg-surface/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                {errors.profile?.email ? (
                  <span className="text-xs text-red-400">{errors.profile.email.message}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 text-sm text-muted md:col-span-2">
                Avatar URL
                <input
                  {...register("profile.avatarUrl")}
                  className="rounded-lg border border-white/10 bg-surface/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                {errors.profile?.avatarUrl ? (
                  <span className="text-xs text-red-400">{errors.profile.avatarUrl.message}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <SunMedium className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Choose how Nexus renders across light and dark contexts.</p>
            <div className="mt-4">
              <ThemeControl saved={savedTheme} setValue={setValue} />
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-white">Providers</h2>
            <p className="mt-2 text-sm text-muted">Enable or disable model providers available to this workspace.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data.providers.length ? (
                data.providers.map((p, i) => (
                  <label
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-surface/70 px-4 py-3 text-sm text-muted"
                  >
                    <span className="font-semibold text-white">{p.name}</span>
                    <input type="checkbox" {...register(`providers.${i}.enabled` as const)} className="h-4 w-4" />
                  </label>
                ))
              ) : (
                <EmptyState title="No providers" description="Add providers via the Nexus API once connected." />
              )}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-white">Limits &amp; quotas</h2>
            <p className="mt-2 text-sm text-muted">Configure soft limits to keep your telemetry in check.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Daily requests
                <input
                  type="number"
                  min={0}
                  {...register("limits.dailyRequests", { valueAsNumber: true })}
                  className="rounded-lg border border-white/10 bg-surface/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Max tokens
                <input
                  type="number"
                  min={0}
                  {...register("limits.maxTokens", { valueAsNumber: true })}
                  className="rounded-lg border border-white/10 bg-surface/70 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
              </label>
            </div>
          </section>
        </form>
      ) : (
        <EmptyState title="Unable to load settings" description="Check your network connection or reload the page." />
      )}
    </div>
  );
}
