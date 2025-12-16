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
      className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/60 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,158,255,0.08),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(147,96,255,0.1),transparent_30%)] opacity-70" />
      <div className="pointer-events-none absolute inset-5 rounded-[22px] border border-white/12" aria-hidden />
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">{view.label}</p>
            <h2 className="text-2xl font-semibold text-[var(--text-strong)]">{view.summary}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/60 px-3 py-1 text-xs text-[var(--text-muted)] shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
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
              className="group relative flex min-h-[120px] flex-col justify-between gap-3 rounded-2xl border border-white/12 bg-white/70 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.14)] backdrop-blur-lg transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[var(--text-primary)] ring-1 ring-white/30 shadow-inner dark:bg-white/10 dark:ring-white/10">
                  <ChevronRight className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
                    <span>{item.title}</span>
                    {item.link && (
                      <a
                        href={item.link}
                        className="text-[11px] font-medium text-[var(--text-muted)] underline-offset-4 transition-colors hover:text-[var(--text-strong)]"
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
              </div>
            </motion.div>
          ))}
        </div>

        {view.actions && view.actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-white/60 px-4 py-3 text-sm text-[var(--text-muted)] shadow-inner backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
            <Link2 className="h-4 w-4 text-[var(--ryuzen-azure)]" />
            <span className="font-semibold text-[var(--text-primary)]">Quick actions</span>
            {view.actions.map((action) => (
              <span
                key={action}
                className="rounded-full border border-white/25 bg-white/80 px-3 py-1 text-[12px] font-semibold text-[var(--text-strong)] shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/10"
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
