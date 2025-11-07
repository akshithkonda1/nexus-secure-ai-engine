import type { ComponentType, SVGProps } from "react";

interface QuickActionProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  onClick?: () => void;
}

export function QuickAction({ icon: Icon, title, desc, onClick }: QuickActionProps) {
  const isInteractive = typeof onClick === "function";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      aria-disabled={!isInteractive}
      className="group flex w-full items-start gap-4 rounded-xl border border-white/10 bg-elevated/80 p-6 text-left shadow-[0_12px_30px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/20 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:hover:translate-y-0"
    >
      <span className="rounded-lg bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="space-y-1">
        <span className="block text-base font-medium text-white">{title}</span>
        <span className="block text-sm text-muted">{desc}</span>
      </span>
    </button>
  );
}

export default QuickAction;
