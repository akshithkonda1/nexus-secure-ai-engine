import type { ComponentType } from "react";

interface QuickActionProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  onClick?: () => void;
}

export function QuickAction({ icon: Icon, title, desc, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full items-center space-x-4 rounded-xl bg-elevated/80 p-6 text-left text-white shadow-card transition hover:bg-elevated hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="rounded-lg bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-base font-semibold">{title}</span>
        <span className="mt-1 text-sm text-muted">{desc}</span>
      </span>
    </button>
  );
}
