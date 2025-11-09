import { useTheme } from "@/lib/theme";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle(){
  const { theme, setTheme } = useTheme();
  const items = [
    {k:"light", Icon:Sun, label:"Light"},
    {k:"system", Icon:Monitor, label:"System"},
    {k:"dark", Icon:Moon, label:"Dark"},
  ] as const;

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-1">
      {items.map(({k, Icon, label}) => (
        <button
          key={k}
          onClick={() => setTheme(k)}
          className={`px-2.5 py-1.5 rounded-lg text-sm flex items-center gap-1
            ${theme===k ? "bg-[rgb(var(--panel))] text-[rgb(var(--text))] shadow-[var(--elev-1)]" : "text-[color:rgba(var(--text)/0.65)] hover:bg-[rgb(var(--panel))]"}`}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden md:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
