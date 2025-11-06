import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Settings as SettingsIcon, SunMedium } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useSaveSettings, useSettings } from "@/queries/settings";
import { SettingsResponse, type SettingsData } from "@/types/models";
import { toast } from "sonner";
import { AppearanceControls } from "../components/settings/AppearanceControls";
import { useTheme, type ThemePref } from "../theme/useTheme";

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const saveSettings = useSaveSettings();
  const { pref, setPref } = useTheme();
  const savedTheme = data?.appearance?.theme as ThemePref | undefined;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<SettingsData>({
    resolver: zodResolver(SettingsResponse),
    defaultValues: data,
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  useEffect(() => {
    register("appearance.theme");
  }, [register]);

  useEffect(() => {
    if (savedTheme) {
      setPref(savedTheme);
    }
  }, [savedTheme, setPref]);

  const themeChoice = watch("appearance.theme");

  useEffect(() => {
    if (themeChoice && themeChoice !== pref) {
      setPref(themeChoice as ThemePref);
    }
  }, [themeChoice, pref, setPref]);

  useEffect(() => {
    if (pref && pref !== themeChoice) {
      setValue("appearance.theme", pref, { shouldDirty: pref !== savedTheme });
    }
  }, [pref, themeChoice, setValue, savedTheme]);

  const onSubmit = async (values: SettingsData) => {
    const result = await saveSettings.mutateAsync(values).catch(() => undefined);
    if (result?.success) {
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage profile details, appearance, providers, and Nexus guardrails from a single control center."
        actions={
          <button
            type="submit"
            form="settings-form"
            disabled={!isDirty || isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
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
          <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-trustBlue" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Profile</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Update how your teammates see you across Nexus.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Display name
                <input
                  {...register("profile.displayName")}
                  className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                />
                {errors.profile?.displayName ? (
                  <span className="text-xs text-red-500">{errors.profile.displayName.message}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Email
                <input
                  {...register("profile.email")}
                  type="email"
                  className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                />
                {errors.profile?.email ? (
                  <span className="text-xs text-red-500">{errors.profile.email.message}</span>
                ) : null}
              </label>
              <label className="md:col-span-2 flex flex-col gap-2 text-sm text-muted">
                Avatar URL
                <input
                  {...register("profile.avatarUrl")}
                  className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                />
                {errors.profile?.avatarUrl ? (
                  <span className="text-xs text-red-500">{errors.profile.avatarUrl.message}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <SunMedium className="h-5 w-5 text-trustBlue" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Appearance</h2>
            </div>
            <p className="mt-2 text-sm text-muted">Choose how Nexus renders across light and dark contexts.</p>
            <div className="mt-4">
              <AppearanceControls />
            </div>
          </section>

          <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-ink">Providers</h2>
            <p className="mt-2 text-sm text-muted">Enable or disable model providers available to this workspace.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data.providers.length ? (
                data.providers.map((provider, index) => (
                  <label
                    key={provider.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-app bg-app/60 px-4 py-3 text-sm text-muted"
                  >
                    <span className="font-semibold text-ink">{provider.name}</span>
                    <input
                      type="checkbox"
                      {...register(`providers.${index}.enabled` as const)}
                      className="h-5 w-9 cursor-pointer appearance-none rounded-full border border-app bg-panel transition checked:bg-trustBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
                    />
                  </label>
                ))
              ) : (
                <EmptyState title="No providers" description="Add providers via the Nexus API once connected." />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-ink">Limits & quotas</h2>
            <p className="mt-2 text-sm text-muted">Configure soft limits to keep your telemetry in check.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                Daily requests
                <input
                  type="number"
                  min={0}
                  {...register("limits.dailyRequests", { valueAsNumber: true })}
                  className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                Max tokens
                <input
                  type="number"
                  min={0}
                  {...register("limits.maxTokens", { valueAsNumber: true })}
                  className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
                />
              </label>
            </div>
          </section>
        </form>
      ) : (
        <EmptyState
          title="Unable to load settings"
          description="Check your network connection or reload the page."
        />
      )}
    </div>
  );
}
