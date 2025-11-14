interface SessionItemProps {
  title: string;
  desc: string;
  onResume: () => void;
}

export function SessionItem({ title, desc, onResume }: SessionItemProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--surface),0.7)] p-4 shadow-sm transition hover:border-[rgba(var(--border),0.5)] hover:bg-[rgba(var(--surface),0.82)]">
      <div>
        <h4 className="text-sm font-semibold text-[rgb(var(--text))] sm:text-base">{title}</h4>
        <p className="mt-1 text-xs text-muted sm:text-sm">{desc}</p>
      </div>
      <button
        type="button"
        onClick={onResume}
        className="inline-flex items-center rounded-lg border border-[rgba(var(--brand),0.65)] px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-[rgba(var(--brand),0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.6)]"
      >
        Resume
      </button>
    </div>
  );
}

export default SessionItem;
