// Frontend/src/pages/settings/SettingsPage.tsx
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

/* Inline theme control (no mount side-effects) */
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
  const Opt = ({ id, label }: { id: ThemePref; label: string }) => (
    <label className="radio-pill">
      <input
        type="radio"
        name="theme"
        value={id}
        checked={pref === id}
        onChange={() => choose(id)}
        className="accent-current"
      />
      <span>{label}</span>
    </label>
  );
  return (
    <div className="flex flex-wrap gap-2">
      <Opt id="light" label="Light" />
      <Opt id="dark" label="Dark" />
      <Opt id="system" label="System" />
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

  useEffect(() => { if (data) reset(data); }, [data, reset]);
  useEffect(() => { register("appearance.theme"); }, [register]);

  const savedTheme = data?.appearance?.theme as ThemePref | undefined;

  const onSubmit = async (values: SettingsData) => {
    const result = await saveSettings.mutateAsync(values).catch(() => undefined);
    if (result?.success) toast.success("Settings saved");
    else toast.error("Failed to save settings");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage profile details, appearance, providers, and Nexus guardrails from a single control center."
        actions={
          <button type="submit" form="settings-form" disabled={!isDirty || isSubmitting} className="btn-primary">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-52" />
          <Skeleton className="h-48" />
        </div>
      ) : data ? (
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile */}
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-blue-700" />
              <h2 className="text-lg font-semibold text-ink">Profile</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Update how your teammates see you across Nexus.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Display name
                <input {...register("profile.displayName")} className="input" />
                {errors.profile?.displayName && (
                  <span className="text-xs text-red-500">{errors.profile.displayName.message}</span>
                )}
              </label>

              <label className="flex flex-col gap-2 text-sm text-muted">
                Email
                <input {...register("profile.email")} type="email" className="input" />
                {errors.profile?.email && (
                  <span className="text-xs text-red-500">{errors.profile.email.message}</span>
                )}
              </label>

              <label className="md:col-span-2 flex flex-col gap-2 text-sm text-muted">
                Avatar URL
                <input {...register("profile.avatarUrl")} className="input" />
                {errors.profile?.avatarUrl && (
                  <span className="text-xs text-red-500">{errors.profile.avatarUrl.message}</span>
                )}
              </label>
            </div>
          </section>

          {/* Appearance */}
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <SunMedium className="h-5 w-5 text-blue-700" />
              <h2 className="text-lg font-semibold text-ink">Appearance</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Choose how Nexus renders across light and dark contexts.</p>
            <div className="mt-4">
              <ThemeControl saved={savedTheme} setValue={setValue} />
            </div>
          </section>

          {/* Providers */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-ink">Providers</h2>
            <p className="mt-2 text-sm text-muted">Enable or disable model providers available to this workspace.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data.providers.length ? (
                data.providers.map((p, i) => (
                  <label key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-app/60 px-4 py-3 text-sm text-muted border-app">
                    <span className="font-semibold text-ink">{p.name}</span>
                    <input type="checkbox" {...register(`providers.${i}.enabled` as const)} className="switch" />
                  </label>
                ))
              ) : (
                <EmptyState title="No providers" description="Add providers via the Nexus API once connected." />
              )}
            </div>
          </section>

          {/* Limits */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold text-ink">Limits & quotas</h2>
            <p className="mt-2 text-sm text-muted">Configure soft limits to keep your telemetry in check.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Daily requests
                <input type="number" min={0} {...register("limits.dailyRequests", { valueAsNumber: true })} className="input" />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Max tokens
                <input type="number" min={0} {...register("limits.maxTokens", { valueAsNumber: true })} className="input" />
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
