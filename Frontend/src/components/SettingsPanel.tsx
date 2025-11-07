import { useMemo, useState } from "react";
import { Palette, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { useTheme } from "@/theme/useTheme";

const THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
] as const;

const PROVIDERS = [
  { name: "OpenAI GPT-4o", description: "Recommended for balanced reasoning." },
  { name: "Anthropic Claude", description: "Great for nuanced debate tone." },
  { name: "Mistral Large", description: "Specialist for compact summaries." },
];

export function SettingsPanel() {
  const { pref, setPref } = useTheme();
  const [activeProviders, setActiveProviders] = useState(() => new Set(["OpenAI GPT-4o", "Anthropic Claude"]));
  const [limits, setLimits] = useState({ daily: 1500, tokens: 200_000 });

  const themeDescription = useMemo(() => {
    switch (pref) {
      case "light":
        return "Bright mode with subtle surfaces for daylight sessions.";
      case "system":
        return "Automatically adapts to your operating system preference.";
      default:
        return "High-contrast dark mode tuned for late-night debates.";
    }
  }, [pref]);

  return (
    <div className="space-y-8 text-white">
      <section className="rounded-xl border border-white/10 bg-surface/70 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
        <header className="flex items-center gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <Palette className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Appearance</h3>
            <p className="text-xs text-muted">Select the canvas that fits your workspace.</p>
          </div>
        </header>
        <div className="mt-4 flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => {
            const isActive = pref === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPref(option.value)}
                className={`flex min-w-[7rem] flex-1 items-center justify-between gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "border-primary/60 bg-primary/10 text-white"
                    : "border-white/10 bg-elevated/60 text-muted hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{option.label}</span>
                {isActive && <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">{themeDescription}</p>
      </section>

      <section className="rounded-xl border border-white/10 bg-surface/70 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
        <header className="flex items-center gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Providers</h3>
            <p className="text-xs text-muted">Enable engines available to your workspace.</p>
          </div>
        </header>
        <div className="mt-5 space-y-3">
          {PROVIDERS.map((provider) => {
            const enabled = activeProviders.has(provider.name);
            return (
              <button
                key={provider.name}
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => {
                  setActiveProviders((prev) => {
                    const next = new Set(prev);
                    if (next.has(provider.name)) {
                      next.delete(provider.name);
                    } else {
                      next.add(provider.name);
                    }
                    return next;
                  });
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  enabled ? "border-primary/50 bg-primary/10 text-white" : "border-white/10 bg-elevated/60 text-muted hover:border-white/20 hover:text-white"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">{provider.name}</span>
                  <span className="mt-1 block text-xs text-muted">{provider.description}</span>
                </span>
                <span
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                    enabled ? "bg-primary" : "bg-white/10"
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-surface/70 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.35)]">
        <header className="flex items-center gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Limits & quotas</h3>
            <p className="text-xs text-muted">Guardrails to keep debates on-budget.</p>
          </div>
        </header>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-muted">
            Daily requests
            <input
              type="number"
              value={limits.daily}
              onChange={(event) => setLimits((prev) => ({ ...prev, daily: Number(event.target.value) }))}
              className="rounded-lg border border-white/10 bg-elevated/60 px-3 py-2 text-sm text-white shadow-inner focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            Max tokens
            <input
              type="number"
              value={limits.tokens}
              onChange={(event) => setLimits((prev) => ({ ...prev, tokens: Number(event.target.value) }))}
              className="rounded-lg border border-white/10 bg-elevated/60 px-3 py-2 text-sm text-white shadow-inner focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
        </div>
        <p className="mt-4 text-xs text-muted">Adjust caps anytime. Changes propagate instantly across Nexus services.</p>
      </section>
    </div>
  );
}

export default SettingsPanel;
