import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import "@/styles/toron.css";

export function ToronHeader() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3 pb-6 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 26 }}
        className="space-y-2"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-elevated)]/70 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-sm shadow-black/10">
          <span className="h-2 w-2 rounded-full bg-[var(--toron-accent)]" />
          Ryuzen Autonomous Surface
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-4xl">Toron</h1>
          <p className="max-w-3xl text-base text-[var(--text-secondary)] sm:text-lg">
            Your autonomous, multi-model orchestration surface.
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 24, delay: 0.08 }}
        className="relative h-[3px] w-full overflow-hidden rounded-full bg-[var(--border-soft)]"
        style={{
          ["--toron-accent" as string]: resolvedTheme === "dark" ? "var(--toron-accent-dark)" : "var(--toron-accent-light)",
        }}
      >
        <div className="toron-animated-bar" />
      </motion.div>
    </div>
  );
}

export default ToronHeader;
