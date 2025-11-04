// Frontend/src/pages/Settings.tsx
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Download, MoonStar, Shield, SunMedium } from "lucide-react";
import { useDebateStore } from "@/stores/debateStore";
import { useTheme } from "@/stores/themeStore";

/* --------------------------- Appearance / Theme --------------------------- */

export default function Settings() {
  const themeChoice = useTheme((s) => s.theme);
  const resolvedTheme = useTheme((s) => s.resolvedTheme);
  const setTheme = useTheme((s) => s.setTheme);

  const telemetryOptIn = useDebateStore((s) => s.telemetryOptIn);
  const setOptIn = useDebateStore((s) => s.setOptIn);
  const history = useDebateStore((s) => s.history);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payload = history.map((h) => ({
        query: h.query,
        consensus: h.consensus,
        overallScore: h.overallScore,
        responses: h.responses,
        timestamp: h.timestamp,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus-history-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 text-muted">
      {/* Appearance */}
      <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <SunMedium className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-ink">Appearance</h1>
        </header>
        <p className="mt-2 text-sm text-muted">Choose the theme that works best for your focus.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${
              themeChoice === "light"
                ? "border-trustBlue/60 bg-trustBlue/10 text-ink"
                : "border-app bg-panel text-muted hover:text-ink"
            }`}
            aria-pressed={themeChoice === "light"}
          >
            <SunMedium className="h-4 w-4" aria-hidden="true" />
            Light
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${
              themeChoice === "dark"
                ? "border-trustBlue/60 bg-trustBlue/10 text-ink"
                : "border-app bg-panel text-muted hover:text-ink"
            }`}
            aria-pressed={themeChoice === "dark"}
          >
            <MoonStar className="h-4 w-4" aria-hidden="true" />
            Dark
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg ${
              themeChoice === "system"
                ? "border-trustBlue/60 bg-trustBlue/10 text-ink"
                : "border-app bg-panel text-muted hover:text-ink"
            }`}
            aria-pressed={themeChoice === "system"}
            aria-label={`Use system theme (currently ${resolvedTheme} mode)`}
            title={`Use system theme (currently ${resolvedTheme} mode)`}
            data-resolved-theme={resolvedTheme}
          >
            <span className="h-4 w-4 rounded-full border border-app" aria-hidden="true" />
            System
          </button>
        </div>
      </section>

      {/* Telemetry */}
      <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-ink">Telemetry</h2>
        </header>
        <p className="mt-2 text-sm text-muted">
          Share anonymous usage data to help us improve Nexus.ai’s debate engine. You can change this at any time.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-app bg-panel p-4 text-sm text-ink">
          <span className="text-sm font-medium text-ink">
            {telemetryOptIn ? "Opted in" : "Opted out"}
          </span>

          <label className="inline-flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted">Telemetry</span>
            <input
              type="checkbox"
              className="h-5 w-9 appearance-none rounded-full border border-app bg-panel transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg checked:border-trustBlue checked:bg-trustBlue"
              checked={telemetryOptIn}
              onChange={(e) => void setOptIn(e.target.checked)}
              aria-label="Toggle telemetry opt-in"
            />
          </label>
        </div>
      </section>

      {/* Preferred Models */}
      <PreferredModelsSection />

      {/* History export */}
      <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <Download className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-ink">History</h2>
        </header>

        <p className="mt-2 text-sm text-muted">
          Export your recent debates as JSON for safekeeping or to share with the team.
        </p>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || history.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-trustBlue bg-trustBlue px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? "Preparing download…" : "Export JSON"}
        </button>

        {history.length === 0 && (
          <p className="mt-2 text-xs text-muted">Run a query to build your history before exporting.</p>
        )}
      </section>
    </div>
  );
}

/* -------------------------- Preferred Models section -------------------------- */

type ModelInfo = {
  key: string;
  label: string;
  url: string;
};

const ALL_MODELS: ModelInfo[] = [
  { key: "gpt-4o",         label: "GPT-4o",          url: "https://platform.openai.com/docs/models#gpt-4o" },
  { key: "claude-3-opus",  label: "Claude 3 Opus",   url: "https://docs.anthropic.com/claude/docs/models" },
  { key: "gemini-1.5-pro", label: "Gemini 1.5 Pro",  url: "https://ai.google.dev/gemini-api/docs/models" },
  { key: "llama-3.1-405b", label: "Llama 3.1 405B",  url: "https://ai.meta.com/llama/" },
  { key: "mistral-large",  label: "Mistral Large",   url: "https://docs.mistral.ai/getting-started/models/" },
];

// localStorage keys
const PREFER_ENABLED_KEY = "nexus.preferredModels.enabled";
const PREFERRED_MAP_KEY  = "nexus.preferredModels.map";

// SSR-safe helpers
const safeGet = (k: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(k));
const safeSet = (k: string, v: string) => {
  if (typeof window !== "undefined") window.localStorage.setItem(k, v);
};

function PreferredModelsSection() {
  const [preferEnabled, setPreferEnabled] = useState<boolean>(() => {
    const raw = safeGet(PREFER_ENABLED_KEY);
    return raw ? raw === "true" : false;
  });

  const [preferred, setPreferred] = useState<Record<string, boolean>>(() => {
    const raw = safeGet(PREFERRED_MAP_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => safeSet(PREFER_ENABLED_KEY, String(preferEnabled)), [preferEnabled]);
  useEffect(() => safeSet(PREFERRED_MAP_KEY, JSON.stringify(preferred)), [preferred]);

  const selectedCount = useMemo(
    () => Object.values(preferred).filter(Boolean).length,
    [preferred]
  );

  const togglePreferred = (key: string) =>
    setPreferred((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Preferred models</h2>

        {/* Master ON/OFF */}
        <label className="inline-flex select-none items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted">
            {preferEnabled ? "On" : "Off"}
          </span>
          <input
            type="checkbox"
            checked={preferEnabled}
            onChange={(e) => setPreferEnabled(e.target.checked)}
            className="peer sr-only"
            aria-label="Toggle preferred models"
          />
          <span
            className={[
              "relative inline-flex h-5 w-9 items-center rounded-full border border-app",
              preferEnabled ? "bg-trustBlue/90" : "bg-panel",
            ].join(" ")}
          >
            <span
              className={[
                "absolute left-0.5 h-4 w-4 rounded-full bg-ink/10 transition-all",
                "peer-checked:translate-x-4 peer-checked:bg-white",
              ].join(" ")}
            />
          </span>
        </label>
      </header>

      <p className="mt-2 text-sm text-muted">
        When <span className="font-medium text-ink">On</span>, Nexus will try these models first, then fall back
        to consensus. When <span className="font-medium text-ink">Off</span>, Nexus uses consensus only.
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {ALL_MODELS.map((m) => {
          const isChecked = !!preferred[m.key];
          return (
            <li
              key={m.key}
              className={[
                "flex items-center justify-between rounded-xl border border-app bg-panel p-4",
                !preferEnabled ? "opacity-60" : "",
              ].join(" ")}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{m.label}</div>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-trustBlue hover:underline"
                  aria-label={`Open ${m.label} documentation`}
                >
                  Docs <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!preferEnabled}
                  checked={isChecked}
                  onChange={() => togglePreferred(m.key)}
                  className="h-4 w-4 rounded border-app bg-panel text-trustBlue disabled:opacity-50 focus:ring-2 focus:ring-trustBlue/70 focus:ring-offset-2 focus:ring-offset-app-bg checked:border-trustBlue checked:bg-trustBlue checked:text-white"
                  aria-describedby={`pref-${m.key}`}
                />
                <span id={`pref-${m.key}`} className="text-xs uppercase tracking-wide text-muted">
                  {isChecked ? "Preferred" : "—"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs text-muted">
        {preferEnabled
          ? `${selectedCount} preferred model${selectedCount === 1 ? "" : "s"} selected.`
          : "Consensus only (no model preferences)."}
      </p>
    </section>
  );
}
