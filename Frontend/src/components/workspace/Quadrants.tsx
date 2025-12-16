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
          className="group relative overflow-hidden rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--layer-surface)] shadow-sm ring-1 ring-[var(--line-subtle)]">
              <item.icon className="h-5 w-5 text-[var(--text-primary)]" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{item.indicator}</p>
              <p className="text-xl font-semibold text-[var(--text-strong)]">{item.metric}</p>
            </div>
          </div>
          <div className="relative mt-3 space-y-1.5">
            <h3 className="text-base font-semibold text-[var(--text-strong)]">{item.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.description}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
