import { motion } from "framer-motion";

export default function Workspace() {
  return (
    <PageStub
      title="Workspace"
      subtitle="Collaborative boards, adaptive statuses, and Ryuzen-powered alignment for every mission."
    />
  );
}

function PageStub({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.section
      className="glass-panel rounded-3xl border border-[var(--border-strong)] p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }}
    >
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen</p>
      <h1 className="text-3xl font-semibold text-[var(--text-primary)]">{title}</h1>
      <p className="mt-2 text-[var(--text-secondary)]">{subtitle}</p>
    </motion.section>
  );
}
