import { motion } from "framer-motion";
import React from "react";

export type ModuleStatus = "online" | "degraded" | "offline" | "idle";

export interface ModuleTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
  status?: ModuleStatus;
}

export function ModuleTile({
  title,
  description,
  icon,
  delay = 0,
  status,
}: ModuleTileProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] px-6 py-5 md:px-8 md:py-6 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 60px rgba(0, 255, 200, 0.25)",
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-cyan-500/12 via-purple-600/6 to-emerald-500/12 pointer-events-none"
        aria-hidden
      />
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/5 blur-2xl" aria-hidden />
      {status && (
        <span className="absolute right-5 top-5 rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
          {status}
        </span>
      )}
      <div className="relative space-y-4">
        <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--text-secondary)] mb-1">
          Module
        </p>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] shadow-inner shadow-black/40">
            {icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-[320px]">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
