import { useTheme, ThemeMode } from "../theme/ThemeProvider";

const toggles = [
  { label: "Notifications", description: "Workspace updates" },
  { label: "Session safety", description: "Strict" },
  { label: "Logging", description: "Enabled for audit" },
];

export default function SettingsPage() {
  const { mode, resolved, setMode } = useTheme();

  const handleThemeChange = (value: ThemeMode) => {
    setMode(value);
  };

  return (
    <section className="flex flex-col gap-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Settings</p>
        <h1 className="text-[28px] font-semibold text-[var(--text-strong)]">Controlled preferences</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Appearance and safety options stay in simple lists. No gradients or distractions.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-6">
          <div className="text-sm font-semibold text-[var(--text-primary)]">Appearance</div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Select light, dark, or follow the system.</p>
          <div className="mt-4 flex gap-2 text-sm">
            {["light", "dark", "system"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleThemeChange(value as ThemeMode)}
                className={`rounded-xl border px-4 py-2.5 capitalize transition ${
                  mode === value
                    ? "border-[var(--line-strong)] bg-[var(--layer-active)] text-[var(--text-strong)]"
                    : "border-[var(--line-subtle)] text-[var(--text-muted)] hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--text-muted)]">Current: {resolved}</p>
        </div>

        <div className="rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-6">
          <div className="text-sm font-semibold text-[var(--text-primary)]">Controls</div>
          <div className="mt-3 space-y-3 text-sm">
            {toggles.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-3">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{item.label}</div>
                  <p className="text-[var(--text-muted)]">{item.description}</p>
                </div>
                <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" defaultChecked />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
