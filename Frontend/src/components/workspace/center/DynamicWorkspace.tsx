import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Clock4, Link2, ArrowUpRight } from "lucide-react";
import { OSBarItem } from "../osbar/OSBar";

type WorkspaceView = OSBarItem & {
  summary: string;
  items: { title: string; meta: string; status: string; link?: string }[];
  actions?: string[];
};

type DynamicWorkspaceProps = {
  view: WorkspaceView;
};

export default function DynamicWorkspace({ view }: DynamicWorkspaceProps) {
  return (
    <motion.div
      key={view.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border border-[var(--line-subtle)] bg-gradient-to-br from-[var(--layer-surface)] via-[var(--layer-muted)] to-[var(--layer-surface)] p-6 shadow-lg"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,158,255,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(147,96,255,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-4 rounded-2xl border border-white/10" aria-hidden />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{view.label}</p>
            <h2 className="text-2xl font-semibold text-[var(--text-strong)]">{view.summary}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[var(--layer-surface)] px-3 py-1 text-xs text-[var(--text-muted)] shadow-inner">
            <Sparkles className="h-4 w-4 text-[var(--ryuzen-purple)]" />
            <span>Toron curating this view</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {view.items.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-start gap-3 rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-4 transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-white shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
                  <span>{item.title}</span>
                  {item.link && (
                    <a
                      href={item.link}
                      className="text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Open <ArrowUpRight className="inline h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">{item.meta}</p>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <Clock4 className="h-3.5 w-3.5" />
                  <span>{item.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {view.actions && view.actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--layer-surface)]/70 px-4 py-3 text-sm text-[var(--text-muted)]">
            <Link2 className="h-4 w-4 text-[var(--accent)]" />
            <span className="font-semibold text-[var(--text-primary)]">Quick actions</span>
            {view.actions.map((action) => (
              <span
                key={action}
                className="rounded-full bg-[var(--pill)] px-3 py-1 text-[12px] font-medium text-[var(--text-strong)] shadow-sm"
              >
                {action}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
