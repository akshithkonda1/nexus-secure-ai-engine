import { CalendarClock, Clock3 } from "lucide-react";

type CalendarWidgetProps = {
  className?: string;
};

const agenda = [
  { time: "09:30", title: "Design sync", detail: "3 teammates" },
  { time: "12:00", title: "Client window", detail: "Calm check-in" },
  { time: "15:30", title: "Focus block", detail: "Reserved" },
];

export default function CalendarWidget({ className }: CalendarWidgetProps) {
  return (
    <section
      aria-label="Calendar widget"
      className={`flex min-w-[clamp(260px,22vw,360px)] flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 text-[var(--text)] shadow-[0_18px_60px_-65px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-muted)] text-[var(--accent)] ring-1 ring-[var(--line-subtle)]/50">
            <CalendarClock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Calendar</p>
            <p className="text-xs text-[var(--text-muted)]">Time authority</p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">Synced</span>
      </header>
      <div className="space-y-2 overflow-y-auto">
        {agenda.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2 text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--muted)] shadow-sm ring-1 ring-[var(--line-subtle)]/40">
              <Clock3 className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-tight">{item.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
              <p className="text-xs text-[var(--muted)]">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
