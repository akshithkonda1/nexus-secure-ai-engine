import { useMemo, useState } from "react";
import { Palette, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { useTheme } from "@/shared/ui/theme/ThemeProvider";

const THEME_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

const PROVIDERS = [
  { name: "OpenAI GPT-4o", description: "Recommended for balanced reasoning." },
  { name: "Anthropic Claude", description: "Great for nuanced debate tone." },
  { name: "Mistral Large", description: "Specialist for compact summaries." },
];

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [activeProviders, setActiveProviders] = useState(() => new Set(["OpenAI GPT-4o", "Anthropic Claude"]));
  const [limits, setLimits] = useState({ daily: 1500, tokens: 200_000 });

  const themeDescription = useMemo(() => {
    switch (theme) {
      case "light":
        return "Bright mode with subtle surfaces for daylight sessions.";
      default:
        return "High-contrast dark mode tuned for late-night debates.";
    }
  }, [theme]);

  return (
    <div className="space-y-8 text-[rgb(var(--text))]">
      <section className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex items-center gap-3">
          <span className="rounded-lg bg-[rgba(var(--brand),0.12)] p-2 text-[rgb(var(--brand))]">
            <Palette className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Appearance</h3>
            <p className="text-xs text-[rgba(var(--subtle),0.75)]">Select the canvas that fits your workspace.</p>
          </div>
        </header>
        <div className="mt-4 flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => {
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`flex min-w-[7rem] flex-1 items-center justify-between gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.35)] ${
                  isActive
                    ? "border-[rgba(var(--brand),0.5)] bg-[rgba(var(--brand),0.12)] text-[rgb(var(--text))]"
                    : "border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] text-[rgba(var(--subtle),0.85)] hover:text-[rgb(var(--text))]"
                }`}
              >
                <span>{option.label}</span>
                {isActive && <Sparkles className="h-4 w-4 text-[rgb(var(--brand))]" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-[rgba(var(--subtle),0.75)]">{themeDescription}</p>
      </section>

      <section className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex items-center gap-3">
          <span className="rounded-lg bg-[rgba(var(--brand),0.12)] p-2 text-[rgb(var(--brand))]">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Providers</h3>
            <p className="text-xs text-[rgba(var(--subtle),0.75)]">Enable engines available to your workspace.</p>
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
                className={`flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.35)] ${
                  enabled
                    ? "border-[rgba(var(--brand),0.5)] bg-[rgba(var(--brand),0.12)] text-[rgb(var(--text))]"
                    : "border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] text-[rgba(var(--subtle),0.85)] hover:text-[rgb(var(--text))]"
                }`}
              >
                <span>
                  <span className="block text-sm font-semibold">{provider.name}</span>
                  <span className="mt-1 block text-xs text-[rgba(var(--subtle),0.75)]">{provider.description}</span>
                </span>
                <span
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                    enabled ? "bg-[rgb(var(--brand))]" : "bg-[rgba(var(--border),0.35)]"
                  }`}
                  aria-hidden="true"
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-[rgb(var(--surface))] transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex items-center gap-3">
          <span className="rounded-lg bg-[rgba(var(--brand),0.12)] p-2 text-[rgb(var(--brand))]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Limits & quotas</h3>
            <p className="text-xs text-[rgba(var(--subtle),0.75)]">Guardrails to keep debates on-budget.</p>
          </div>
        </header>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[rgba(var(--subtle),0.78)]">
            Daily requests
            <input
              type="number"
              value={limits.daily}
              onChange={(event) => setLimits((prev) => ({ ...prev, daily: Number(event.target.value) }))}
              className="rounded-lg border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2 text-sm text-[rgb(var(--text))] shadow-inner focus:border-[rgba(var(--brand),0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.35)]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[rgba(var(--subtle),0.78)]">
            Max tokens
            <input
              type="number"
              value={limits.tokens}
              onChange={(event) => setLimits((prev) => ({ ...prev, tokens: Number(event.target.value) }))}
              className="rounded-lg border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.6)] px-3 py-2 text-sm text-[rgb(var(--text))] shadow-inner focus:border-[rgba(var(--brand),0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.35)]"
            />
          </label>
        </div>
        <p className="mt-4 text-xs text-[rgba(var(--subtle),0.75)]">Adjust caps anytime. Changes propagate instantly across Ryuzen services.</p>
      </section>
    </div>
  );
}

export default SettingsPanel;
