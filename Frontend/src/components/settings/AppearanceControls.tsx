import { useTheme, type ThemePref } from "../../theme/useTheme";

export function AppearanceControls() {
  const { pref, effective, setPref } = useTheme();
  const Btn = ({ value, label }: { value: ThemePref; label: string }) => (
    <button
      type="button"
      onClick={() => setPref(value)}
      className={[
        "rounded-xl border px-3.5 py-2 text-sm transition",
        pref === value ? "bg-panel panel panel--glassy panel--hover text-ink border-trustBlue" : "bg-app text-muted border-app hover:text-ink"
      ].join(" ")}
      aria-pressed={pref === value}
    >
      {label}
    </button>
  );
  return (
    <div className="rounded-2xl border border-app bg-panel panel panel--glassy panel--hover p-4">
      <h3 className="mb-2 text-base font-semibold text-ink">Appearance</h3>
      <p className="mb-3 text-sm text-muted">Choose how Nexus renders. <span className="ml-2 text-ink/60">Current: {effective}</span></p>
      <div className="flex flex-wrap gap-2">
        <Btn value="light" label="Light" />
        <Btn value="dark" label="Dark" />
        <Btn value="system" label="System" />
      </div>
    </div>
  );
}
