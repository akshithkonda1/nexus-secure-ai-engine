import { clsx } from "clsx";
import {
  MessageCircle,
  Layers,
  FileText,
  History,
  Settings,
  LayoutDashboard
} from "lucide-react";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const items: Item[] = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/templates", label: "Templates", icon: Layers },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar({
  active,
  onNavigate
}: {
  active: string;
  onNavigate: (to: string) => void;
}) {
  return (
    <aside
      className="h-full border-r"
      style={{ borderColor: `rgb(var(--border))` }}
    >
      <div className="flex h-16 items-center justify-center">
        <span className="text-sm font-semibold tracking-wide"
          style={{ color: "var(--brand)" }}>
          Nexus
        </span>
      </div>
      <nav className="flex flex-col items-center gap-1 py-2">
        {items.map((it) => {
          const Icon = it.icon;
          const selected = active === it.to || (it.to !== "/" && active.startsWith(it.to));
          return (
            <button
              key={it.to}
              onClick={() => onNavigate(it.to)}
              title={it.label}
              className={clsx(
                "group relative my-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl",
                selected
                  ? "bg-[color:var(--brand)] text-white shadow-glow"
                  : "bg-[rgb(var(--surface))] border border-[rgb(var(--border))] hover:border-[color:var(--brand)]"
              )}
            >
              <Icon className={clsx("h-5 w-5",
                selected ? "opacity-100" : "text-[rgb(var(--text)/.8)] group-hover:text-[color:var(--brand)]")} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
