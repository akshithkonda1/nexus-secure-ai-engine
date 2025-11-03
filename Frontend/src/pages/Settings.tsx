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
    <div className="space-y-8 text-silver">
      <section className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <SunMedium className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-white">Appearance</h1>
        </header>
        <p className="mt-2 text-sm text-silver/70">Choose the theme that works best for your focus.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trustBlue/70 ${
              theme === "light"
                ? "border-slate-200 bg-slate-100 text-slate-900"
                : "border-white/10 bg-black/40 text-silver hover:border-white/30"
            }`}
          >
            <SunMedium className="h-4 w-4" aria-hidden="true" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trustBlue/70 ${
              theme === "dark"
                ? "border-white/20 bg-white/10 text-black"
                : "border-white/10 bg-black/40 text-silver hover:border-white/30"
            }`}
          >
            <MoonStar className="h-4 w-4" aria-hidden="true" />
            Dark
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">Telemetry</h2>
        </header>
        <p className="mt-2 text-sm text-silver/70">
          Share anonymous usage data to help us improve Nexus.ai’s debate engine. You can change this at any time.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/60 p-4 text-sm">
          <span>{telemetryOptIn ? "Opted in" : "Opted out"}</span>
          <label className="inline-flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-silver/60">Telemetry</span>
            <input
              type="checkbox"
              className="h-5 w-9 appearance-none rounded-full border border-white/10 bg-white/5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trustBlue/70"
              checked={telemetryOptIn}
              onChange={(event) => {
                void setOptIn(event.target.checked);
              }}
              aria-label="Toggle telemetry opt-in"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Model selection</h2>
        </header>
        <p className="mt-2 text-sm text-silver/70">Control which models participate in debates. We recommend keeping at least two enabled.</p>
        <ul className="mt-4 space-y-3">
          {AVAILABLE_MODELS.map((model) => (
            <li key={model} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 p-4 text-sm">
              <span>{model}</span>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name={model}
                  checked={models[model]}
                  onChange={handleModelToggle}
                  className="h-4 w-4 rounded border-white/10 bg-black text-white focus:ring-2 focus:ring-trustBlue/70 focus:ring-offset-2 focus:ring-offset-black"
                  aria-describedby="model-preference-hint"
                />
                <span className="text-xs uppercase tracking-wide text-silver/60">Enabled</span>
              </label>
            </li>
          ))}
        </ul>
        <p id="model-preference-hint" className="mt-3 text-xs text-silver/60">
          {selectedCount} model{selectedCount === 1 ? "" : "s"} selected.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-xl">
        <header className="flex items-center gap-3">
          <Download className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">History</h2>
        </header>
        <p className="mt-2 text-sm text-silver/70">
          Export your recent debates as JSON for safekeeping or to share with the team.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || history.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-silver px-4 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trustBlue/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? "Preparing download…" : "Export JSON"}
        </button>
        {history.length === 0 ? (
          <p className="mt-2 text-xs text-silver/60">Run a query to build your history before exporting.</p>
        ) : null}
      </section>
    </div>
  );
}
