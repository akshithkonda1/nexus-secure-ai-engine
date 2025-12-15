import { LucideIcon, Plus } from "lucide-react";

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  onClick?: () => void;
}

export default function ActionCard({ title, icon: Icon, iconBg, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-5 py-4 transition hover:border-[var(--line-strong)] hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" aria-hidden />
        </div>
        <span className="text-sm font-medium text-[var(--text-strong)]">{title}</span>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-surface)] transition group-hover:border-[var(--line-strong)] group-hover:bg-[var(--layer-active)]">
        <Plus className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-strong)]" aria-hidden />
      </div>
    </button>
  );
}
