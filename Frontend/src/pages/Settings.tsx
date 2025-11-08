import { useState } from "react";
import { useTheme } from "@/theme/useTheme";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [providers, setProviders] = useState({
    openai: true,
    anthropic: true,
    mistral: false,
  });

  function toggle(name: keyof typeof providers) {
    setProviders((p) => ({ ...p, [name]: !p[name] }));
  }

  const [daily, setDaily] = useState(1500);
  const [maxTokens, setMaxTokens] = useState(200000);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
        <h3 className="font-medium">Appearance</h3>
        <p className="text-sm text-subtle mt-1">Choose how Nexus renders.</p>
        <div className="mt-4 flex gap-2">
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`h-9 px-3 rounded-lg border border-border/60 ${
                theme === mode ? "text-white" : "text-foreground"
              }`}
              style={theme === mode ? { backgroundColor: "var(--brand)" } : undefined}
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
        <h3 className="font-medium">Providers</h3>
        <p className="text-sm text-subtle mt-1">
          Enable or disable model providers available to this workspace.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { key: "openai", label: "OpenAI GPT-4o" },
            { key: "anthropic", label: "Anthropic Claude" },
            { key: "mistral", label: "Mistral Large" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/40 px-3 py-2"
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={(providers as any)[key]}
                onChange={() => toggle(key as keyof typeof providers)}
                className="size-5 accent-[color:var(--brand)]"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 p-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
        <h3 className="font-medium">Limits & quotas</h3>
        <p className="text-sm text-subtle mt-1">
          Configure soft limits to keep your telemetry in check.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-subtle">Daily requests</label>
            <input
              type="number"
              value={daily}
              onChange={(e) => setDaily(Number(e.target.value))}
              className="mt-1 w-full h-10 rounded-lg bg-surface/50 border border-border/60 px-3"
            />
          </div>
          <div>
            <label className="text-sm text-subtle">Max tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="mt-1 w-full h-10 rounded-lg bg-surface/50 border border-border/60 px-3"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Settings;
