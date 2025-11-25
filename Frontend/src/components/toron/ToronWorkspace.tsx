import { motion } from "framer-motion";
import { ToronCard } from "./ToronCard";
import "@/styles/toron.css";

export function ToronWorkspace() {
  const blocks = [
    {
      title: "Execution Engine Status",
      subtitle: "Live agent runtime",
      content: (
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-3">
            <div className="toron-pulse dot h-4 w-4" />
            <div className="space-y-1">
              <p className="text-[var(--text-primary)]">Online</p>
              <p>Heartbeat synced to orchestration core.</p>
            </div>
          </div>
          <span className="rounded-full bg-[var(--border-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">Stable</span>
        </div>
      ),
    },
    {
      title: "Model Load",
      subtitle: "Context-aware payloads",
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center justify-between">
            <span>Primary model</span>
            <span className="text-[var(--text-primary)]">Stubbed orchestration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[var(--border-soft)]" />
            <span>Streaming token buffer ready</span>
          </div>
        </div>
      ),
    },
    {
      title: "Pipeline Activity",
      subtitle: "Staged operations",
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          {["Ingress", "Routing", "Synthesis"].map((stage, idx) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 28, delay: idx * 0.05 }}
              className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)]/60 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="toron-pulse dot h-4 w-4" />
                <span>{stage}</span>
              </div>
              <span className="text-xs text-[var(--text-primary)]">Watching</span>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      title: "Node Map",
      subtitle: "Spatial orchestration preview",
      content: (
        <div className="relative h-48 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)]/60">
          <div className="toron-grid" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-card)]/80 px-4 py-2 text-xs text-[var(--text-secondary)] shadow-sm">
              <div className="h-5 w-5 rounded bg-[var(--border-soft)]" />
              Node map placeholder
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {blocks.map((block, idx) => (
        <motion.div
          key={block.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30, delay: idx * 0.04 }}
        >
          <ToronCard title={block.title} subtitle={block.subtitle}>
            {block.content}
          </ToronCard>
        </motion.div>
      ))}
    </div>
  );
}

export default ToronWorkspace;
