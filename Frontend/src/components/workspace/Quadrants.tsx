import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Quadrant = {
  id: string;
  title: string;
  description: string;
  metric: string;
  indicator: string;
  icon: LucideIcon;
  accent: string;
};

type QuadrantsProps = {
  items: Quadrant[];
};

export default function Quadrants({ items }: QuadrantsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <motion.article
          key={item.id}
          className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/50 p-5 shadow-[0_14px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
          whileHover={{ translateY: -4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/6 via-white/4 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5 dark:via-white/0" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[var(--text-primary)] ring-1 ring-white/25 shadow-inner dark:bg-white/10 dark:ring-white/10">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="text-right space-y-1">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">{item.indicator}</p>
              <p className="text-xl font-semibold text-[var(--text-strong)]">{item.metric}</p>
            </div>
          </div>
          <div className="relative mt-4 space-y-2">
            <h3 className="text-lg font-semibold text-[var(--text-strong)]">{item.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.description}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
