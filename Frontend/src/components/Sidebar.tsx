import { NavLink } from "react-router-dom";
import {
  MessageCircle, Folder, Sparkles, FileText, BarChart3,
  History, Settings, Sun
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type Item = { to: string; label: string; Icon: any };

const items: Item[] = [
  { to: "/chat",      label: "Chat",      Icon: MessageCircle },
  { to: "/sessions",  label: "Sessions",  Icon: Folder },
  { to: "/templates", label: "Templates", Icon: Sparkles },
  { to: "/docs",      label: "Documents", Icon: FileText },
  { to: "/metrics",   label: "Metrics",   Icon: BarChart3 },
  { to: "/history",   label: "History",   Icon: History },
  { to: "/settings",  label: "Settings",  Icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/10 bg-elevated px-4 pb-8 pt-20 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] md:flex">
      {content}
    </aside>
  );
}
