import { GaugeCircle, Palette, Server } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/theme/useTheme";

type AppearanceMode = "light" | "dark" | "system";

type ProviderState = {
  openai: boolean;
  anthropic: boolean;
  mistral: boolean;
};

type LimitState = {
  dailyRequests: number;
  maxTokens: number;
};

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [appearance, setAppearance] = useState<AppearanceMode>(theme);
  const [providers, setProviders] = useState<ProviderState>({
    openai: true,
    anthropic: true,
    mistral: false,
  });
  const [limits, setLimits] = useState<LimitState>({
    dailyRequests: 250,
    maxTokens: 500000,
  });

  useEffect(() => {
    setAppearance(theme);
  }, [theme]);

  const handleAppearanceChange = (mode: AppearanceMode) => {
    setAppearance(mode);
    if (mode === "light" || mode === "dark") {
      setTheme(mode);
    }
  };

  const toggleProvider = (provider: keyof ProviderState) => {
    setProviders((current) => ({ ...current, [provider]: !current[provider] }));
  };

  const updateLimit = (field: keyof LimitState, value: number) => {
    setLimits((current) => ({ ...current, [field]: Number.isNaN(value) ? current[field] : value }));
  };

  return (
    <div className="space-y-10">
      <section className="surface-card space-y-6 p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-soft">
            <Palette className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
            <p className="text-sm text-muted">Choose how Nexus.ai adapts to your environment.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {([
            { value: "dark", title: "Dark", helper: "Default, deep slate glass." },
            { value: "light", title: "Light", helper: "Luminous, polished surfaces." },
            { value: "system", title: "System", helper: "Follow device preference." },
          ] as const).map(({ value, title, helper }) => (
            <label
              key={value}
              className={`group flex cursor-pointer flex-col gap-2 rounded-2xl border border-border/60 bg-card/70 p-4 transition hover:border-accent/40 hover:bg-card/80 ${
                appearance === value ? "border-accent/60 shadow-glow" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted">{helper}</p>
                </div>
                <input
                  type="radio"
                  name="appearance"
                  value={value}
                  checked={appearance === value}
                  onChange={() => handleAppearanceChange(value)}
                  className="h-4 w-4 border-border/70 text-accent focus:ring-accent"
                />
              </div>
              {value === "system" && (
                <p className="text-xs text-muted">
                  System mode syncs with the OS theme when supported. Manual override keeps your choice persistent.
                </p>
              )}
            </label>
          ))}
        </div>
      </section>

      <section className="surface-card space-y-6 p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-soft">
            <Server className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Providers</h2>
            <p className="text-sm text-muted">Enable or pause AI engines powering your workspace.</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { key: "openai", label: "OpenAI GPT-4o", description: "Best for multimodal orchestration." },
            { key: "anthropic", label: "Anthropic Claude", description: "Thoughtful, long-context reasoning." },
            { key: "mistral", label: "Mistral Large", description: "Efficient, cost-optimized deployments." },
          ].map(({ key, label, description }) => (
            <label
              key={key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 px-5 py-4 transition hover:border-accent/40 hover:bg-card/80"
            >
              <span>
                <p className="text-base font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted">{description}</p>
              </span>
              <span className="flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={providers[key as keyof ProviderState]}
                  onChange={() => toggleProvider(key as keyof ProviderState)}
                />
                <span className="relative inline-flex h-7 w-12 items-center rounded-full bg-card/60 transition peer-checked:bg-accent">
                  <span className="absolute left-1 h-5 w-5 transform rounded-full bg-surface/80 shadow-soft transition peer-checked:translate-x-5 peer-checked:bg-accent-foreground" />
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="surface-card space-y-6 p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-soft">
            <GaugeCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Limits &amp; quotas</h2>
            <p className="text-sm text-muted">Define guardrails for usage across the organization.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Daily requests</span>
            <input
              type="number"
              min={0}
              value={limits.dailyRequests}
              onChange={(event) => updateLimit("dailyRequests", Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Max tokens</span>
            <input
              type="number"
              min={0}
              step={100}
              value={limits.maxTokens}
              onChange={(event) => updateLimit("maxTokens", Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
