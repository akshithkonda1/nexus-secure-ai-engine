import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUI } from "@/state/ui";
import {
  NeuralLoadIcon,
  PipelinesIcon,
  ConnectorsIcon,
  WorkspaceIcon,
  TelemetryIcon,
  ResumeEngineIcon,
  FeedbackIcon,
} from "@/components/home/moduleIcons";

export default function RyuzenCommandCenterOverlay() {
  const { commandCenterOpen, closeCommandCenter } = useUI();

  // ESC key closes overlay
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCommandCenter();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = commandCenterOpen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [commandCenterOpen]);

  if (!commandCenterOpen) return null;

  const items = [
    {
      title: "Neural Load",
      desc: "Model orchestration heat",
      icon: <NeuralLoadIcon className="h-6 w-6" />,
    },
    {
      title: "Pipelines",
      desc: "Flow states & triggers",
      icon: <PipelinesIcon className="h-6 w-6" />,
    },
    {
      title: "Connectors",
      desc: "Live integrations",
      icon: <ConnectorsIcon className="h-6 w-6" />,
    },
    {
      title: "Workspace",
      desc: "Quick context sync",
      icon: <WorkspaceIcon className="h-6 w-6" />,
    },
    {
      title: "Telemetry",
      desc: "Live monitoring",
      icon: <TelemetryIcon className="h-6 w-6" />,
    },
    {
      title: "Ryuzen Resume Engine",
      desc: "Node clustering in progress...",
      icon: <ResumeEngineIcon className="h-6 w-6" />,
    },
    {
      title: "Feedback Intelligence",
      desc: "Toron-powered insights",
      icon: <FeedbackIcon className="h-6 w-6" />,
      button: true,
    },
  ];

  return (
    <AnimatePresence>
      {commandCenterOpen && (
        <motion.div
          onClick={closeCommandCenter}
          className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative mt-24 w-full max-w-7xl rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-strong)_92%,transparent)] p-10 shadow-[0_0_60px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.90, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={closeCommandCenter}
              aria-label="Close Command Center"
              className="absolute right-6 top-6 rounded-full p-2 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((mod, i) => (
                <motion.div
                  key={mod.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <div
                    className="group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] 
                    bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-6 
                    shadow-[0_16px_40px_rgba(0,0,0,0.25)]
                    transition hover:border-[var(--accent-primary)]
                    hover:shadow-[0_25px_80px_rgba(0,200,255,0.28)] cursor-pointer"
                  >
                    {/* Glow */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 
                      transition bg-gradient-to-br from-cyan-400 to-purple-500 blur-2xl"
                    />

                    <div className="mb-4 flex items-center gap-3">
                      {mod.icon}
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        {mod.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)]">{mod.desc}</p>

                    {mod.button && (
                      <button className="mt-4 rounded-xl bg-[var(--accent-primary)]/20 px-4 py-2 text-xs font-semibold text-[var(--accent-primary)] transition hover:bg-[var(--accent-primary)]/30">
                        Open Dashboard →
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
