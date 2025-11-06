import { useTheme } from "@/theme/useTheme";

type Opt = { id: "light" | "dark" | "system"; label: string };

const OPTIONS: Opt[] = [
  { id: "light",  label: "Light"  },
  { id: "dark",   label: "Dark"   },
  { id: "system", label: "System" },
];

export default function ThemeControl() {
  const { pref, setPref } = useTheme();

  return (
    <fieldset className="panel p-4">
      <legend className="mb-2 text-sm font-medium text-muted">Appearance</legend>
      <div className="flex gap-2">
        {OPTIONS.map(o => (
          <label key={o.id} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
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
