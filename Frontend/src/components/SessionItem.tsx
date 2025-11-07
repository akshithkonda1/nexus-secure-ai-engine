interface SessionItemProps {
  title: string;
  desc: string;
  onResume: () => void;
}

export function SessionItem({ title, desc, onResume }: SessionItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-surface/70 p-4 shadow-sm transition hover:border-white/20 hover:bg-surface/80">
      <div>
        <h4 className="text-sm font-semibold text-white sm:text-base">{title}</h4>
        <p className="mt-1 text-xs text-muted sm:text-sm">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onResume}
        className="inline-flex items-center rounded-lg border border-primary/70 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Resume
      </button>
    </div>
  );
}

export default SessionItem;
