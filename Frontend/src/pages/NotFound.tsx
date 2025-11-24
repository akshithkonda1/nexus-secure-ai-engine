import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.section
      className="glass-panel relative overflow-hidden rounded-3xl border border-[var(--border-strong)] p-10 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/25 via-transparent to-cyan-400/20 blur-3xl" />
      <div className="relative space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-purple-200">Ryuzen</p>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Page not found</h1>
        <p className="text-[var(--text-secondary)]">The requested view drifted outside the Toron grid.</p>
        <Link
          to="/"
          className="button-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-purple-500/30"
        >
          Return home
        </Link>
      </div>
    </motion.section>
  );
}
