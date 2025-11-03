import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Download, MoonStar, Shield, SunMedium } from "lucide-react";
import { useDebateStore } from "@/stores/debateStore";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

const AVAILABLE_MODELS = ["GPT-4o", "Claude 3 Opus", "Gemini 1.5 Pro"] as const;
const MODELS_KEY = "nexus.modelPreferences";

function loadModelPreferences() {
  if (typeof window === "undefined") {
    return Object.fromEntries(AVAILABLE_MODELS.map((model) => [model, true])) as Record<string, boolean>;
  }
  try {
    const stored = window.localStorage.getItem(MODELS_KEY);
    if (!stored) {
      return Object.fromEntries(AVAILABLE_MODELS.map((model) => [model, true])) as Record<string, boolean>;
    }
    const parsed = JSON.parse(stored) as Record<string, boolean>;
    const defaults = Object.fromEntries(AVAILABLE_MODELS.map((model) => [model, true]));
    return { ...defaults, ...parsed };
  } catch (error) {
    console.warn("Unable to parse model preferences", error);
    return Object.fromEntries(AVAILABLE_MODELS.map((model) => [model, true])) as Record<string, boolean>;
  }
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const telemetryOptIn = useDebateStore((state) => state.telemetryOptIn);
  const setOptIn = useDebateStore((state) => state.setOptIn);
  const history = useDebateStore((state) => state.history);

  const [models, setModels] = useState<Record<string, boolean>>(() => loadModelPreferences());
  const selectedCount = useMemo(() => Object.values(models).filter(Boolean).length, [models]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODELS_KEY, JSON.stringify(models));
    }
  }, [models]);

  const handleModelToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setModels((prev) => ({ ...prev, [name]: checked }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payload = history.map((entry) => ({
        query: entry.query,
        consensus: entry.consensus,
        overallScore: entry.overallScore,
        responses: entry.responses,
        timestamp: entry.timestamp,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexus-history-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <header className="flex items-center gap-3">
          <SunMedium className="h-5 w-5 text-slate-200" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-slate-100">Appearance</h1>
        </header>
        <p className="mt-2 text-sm text-slate-300">Choose the theme that works best for your focus.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 ${
              theme === "light"
                ? "border-slate-200 bg-slate-100 text-slate-900"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
            }`}
          >
            <SunMedium className="h-4 w-4" aria-hidden="true" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200 ${
              theme === "dark"
                ? "border-slate-200 bg-slate-100 text-slate-900"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
            }`}
          >
            <MoonStar className="h-4 w-4" aria-hidden="true" />
            Dark
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <header className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-slate-200" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-100">Telemetry</h2>
        </header>
        <p className="mt-2 text-sm text-slate-300">
          Share anonymous usage data to help us improve Nexus.ai’s debate engine. You can change this at any time.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
          <span>{telemetryOptIn ? "Opted in" : "Opted out"}</span>
          <label className="inline-flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">Telemetry</span>
            <input
              type="checkbox"
              className="h-5 w-9 appearance-none rounded-full border border-slate-600 bg-slate-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
              checked={telemetryOptIn}
              onChange={(event) => {
                void setOptIn(event.target.checked);
              }}
              aria-label="Toggle telemetry opt-in"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <header className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-100">Model selection</h2>
        </header>
        <p className="mt-2 text-sm text-slate-300">Control which models participate in debates. We recommend keeping at least two enabled.</p>
        <ul className="mt-4 space-y-3">
          {AVAILABLE_MODELS.map((model) => (
            <li key={model} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-200">
              <span>{model}</span>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name={model}
                  checked={models[model]}
                  onChange={handleModelToggle}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-describedby="model-preference-hint"
                />
                <span className="text-xs uppercase tracking-wide text-slate-400">Enabled</span>
              </label>
            </li>
          ))}
        </ul>
        <p id="model-preference-hint" className="mt-3 text-xs text-slate-400">
          {selectedCount} model{selectedCount === 1 ? "" : "s"} selected.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <header className="flex items-center gap-3">
          <Download className="h-5 w-5 text-slate-200" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-100">History</h2>
        </header>
        <p className="mt-2 text-sm text-slate-300">
          Export your recent debates as JSON for safekeeping or to share with the team.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || history.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:opacity-60"
        >
          {isExporting ? "Preparing download…" : "Export JSON"}
        </button>
        {history.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">Run a query to build your history before exporting.</p>
        ) : null}
      </section>
    </div>
  );
}
