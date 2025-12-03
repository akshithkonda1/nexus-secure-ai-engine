import { useUI } from "@/state/ui";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
  const { showCommandCenter, closeCommandCenter } = useUI();

  const modules = [
    {
      title: "Neural Load",
      description: "Model orchestration heat",
      icon: NeuralLoadIcon,
    },
    {
      title: "Pipelines",
      description: "Flow states & triggers",
      icon: PipelinesIcon,
    },
    {
      title: "Connectors",
      description: "Live integrations",
      icon: ConnectorsIcon,
    },
    {
      title: "Workspace",
      description: "Quick context sync",
      icon: WorkspaceIcon,
    },
    {
      title: "Telemetry",
      description: "Live monitoring",
      icon: TelemetryIcon,
    },
    {
      title: "Ryuzen Resume Engine",
      description: "Node clustering in progress...",
      icon: ResumeEngineIcon,
    },
    {
      title: "Feedback Intelligence",
      description: "Toron-powered insights",
      icon: FeedbackIcon,
      footerButton: true,
    },
  ];

  return (
    <AnimatePresence>
      {showCommandCenter && (
        <motion.div
          className="fixed inset-0 z-[999] bg-bgElevated/40 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 overflow-y-auto p-12"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          >
            {/* Close Button */}
            <button
              onClick={closeCommandCenter}
              className="absolute top-8 right-8 h-10 w-10 flex items-center justify-center rounded-full
              bg-bgPrimary/10 hover:bg-bgPrimary/20 backdrop-blur-md border border-borderLight/20 
              text-textPrimary shadow-xl transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {modules.map((module, i) => {
                const Icon = module.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03, y: -4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                    className="rounded-3xl border border-borderLight/10 bg-bgPrimary/[0.05] backdrop-blur-xl
                    shadow-[0_18px_60px_rgba(0,0,0,0.45)] p-6 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 pointer-events-none" />

                    <div className="flex items-start gap-4">
                      <Icon className="h-10 w-10 text-textPrimary" />

                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-textPrimary/40">
                          MODULE
                        </p>
                        <p className="text-xl font-semibold text-textPrimary">
                          {module.title}
                        </p>
                        <p className="text-sm text-textPrimary/60 mt-1">
                          {module.description}
                        </p>

                        {module.footerButton && (
                          <button className="mt-4 rounded-xl bg-bgPrimary/10 hover:bg-bgPrimary/20
                          px-4 py-2 text-sm text-textPrimary border border-borderLight/20 transition">
                            Open Dashboard →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
