import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useUI } from "@/state/ui";

// ICON IMPORTS (binary-safe)
import neuralIcon from "@/assets/icons/neural-load.svg";
import pipelinesIcon from "@/assets/icons/pipelines.svg";
import connectorsIcon from "@/assets/icons/connectors.svg";
import workspaceIcon from "@/assets/icons/workspace.svg";
import telemetryIcon from "@/assets/icons/telemetry.svg";
import resumeEngineIcon from "@/assets/icons/resume-engine.svg";
import feedbackIcon from "@/assets/icons/feedback.svg";

export function RyuzenCommandCenterOverlay() {
  const { isCommandCenterOpen, closeCommandCenter } = useUI();

  if (!isCommandCenterOpen) return null;

  const modules = [
    {
      label: "Neural Load",
      desc: "Model orchestration heat",
      icon: neuralIcon,
      route: "/neural",
    },
    {
      label: "Pipelines",
      desc: "Flow states & triggers",
      icon: pipelinesIcon,
      route: "/pipelines",
    },
    {
      label: "Connectors",
      desc: "Live integrations",
      icon: connectorsIcon,
      route: "/connectors",
    },
    {
      label: "Workspace",
      desc: "Quick context sync",
      icon: workspaceIcon,
      route: "/workspace",
    },
    {
      label: "Telemetry",
      desc: "Live monitoring",
      icon: telemetryIcon,
      route: "/telemetry",
    },
    {
      label: "Ryuzen Resume Engine",
      desc: "Node clustering in progress…",
      icon: resumeEngineIcon,
      route: "/resume-engine",
    },
    {
      label: "Feedback Intelligence",
      desc: "Toron-powered insights",
      icon: feedbackIcon,
      route: "/feedback",
      cta: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[999] flex items-start justify-center bg-black/70 backdrop-blur-3xl"
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative mt-14 w-full max-w-7xl rounded-3xl border border-white/10 bg-[color-mix(in_srgb,var(--panel-strong)_96%,transparent)] p-10 shadow-[0_0_80px_rgba(0,0,0,0.55)]"
      >

        {/* CLOSE BUTTON */}
        <button
          onClick={closeCommandCenter}
          className="absolute right-6 top-6 rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 hover:scale-105 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* GRID */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
              whileTap={{ scale: 0.985 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-transparent p-7 backdrop-blur-xl transition-all cursor-pointer"
            >

              {/* Glow Hover Layer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 0.22 }}
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/25 to-emerald-500/25 blur-2xl rounded-2xl pointer-events-none"
              />

              {/* ICON */}
              <img
                src={mod.icon}
                alt={`${mod.label} icon`}
                className="h-9 w-9 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform duration-300"
              />

              {/* LABEL */}
              <p className="mt-4 text-xl font-semibold text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
                {mod.label}
              </p>

              {/* DESCRIPTION */}
              <p className="mt-1 text-sm text-white/60">{mod.desc}</p>

              {/* CTA BUTTON */}
              {mod.cta && (
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-5 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                >
                  Open Dashboard →
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
