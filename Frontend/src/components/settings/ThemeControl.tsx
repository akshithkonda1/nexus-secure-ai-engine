import { useTheme } from "@/theme/useTheme";

type Opt = "light" | "dark" | "system";
const OPTIONS: { id: Opt; label: string }[] = [
  { id: "light",  label: "Light"  },
  { id: "dark",   label: "Dark"   },
  { id: "system", label: "System" },
];

/**
 * Purely controlled theme switcher: no useEffect, no defaultChecked,
 * no localStorage writes except via useTheme.setPref (user intent only).
 */
export default function ThemeControl() {
  const { pref, setPref } = useTheme();

  return (
    <fieldset className="panel panel--glassy panel--hover p-4">
      <legend className="mb-2 text-sm font-medium text-muted">Appearance</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(o => (
          <label key={o.id}
                 className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                 style={{ borderColor: "var(--border)" }}>
            <input
              type="radio"
              name="theme"
              value={o.id}
              checked={pref === o.id}
              onChange={() => setPref(o.id)}
              className="accent-current"
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
