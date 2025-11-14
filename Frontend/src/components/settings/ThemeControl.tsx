import { useTheme } from "@/shared/ui/theme/ThemeProvider";

type Opt = "light" | "dark";
const OPTIONS: { id: Opt; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

/**
 * Purely controlled theme switcher: no useEffect, no defaultChecked,
 * no localStorage writes except via useTheme.setPref (user intent only).
 */
export default function ThemeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className="panel panel--glassy panel--hover p-4">
      <legend className="mb-2 text-sm font-medium text-muted">Appearance</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <label
            key={option.id}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(var(--border),0.5)] bg-[rgba(var(--panel),0.6)] px-3 py-2 text-sm text-[rgb(var(--text))] transition hover:border-[rgba(var(--brand),0.5)]"
          >
            <input
              type="radio"
              name="theme"
              value={option.id}
              checked={theme === option.id}
              onChange={() => setTheme(option.id)}
              className="accent-current"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
