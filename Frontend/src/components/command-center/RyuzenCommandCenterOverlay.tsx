import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUI } from "@/state/ui";

const panels = [
  { title: "Neural Load", body: "Model orchestration heat" },
  { title: "Pipelines", body: "Flow states & triggers" },
  { title: "Connectors", body: "Live integrations" },
  { title: "Workspace", body: "Quick context sync" },
  { title: "Telemetry", body: "Live monitoring" },
  { title: "Ryuzen Resume Engine", body: "Node clustering in progress…" }
];

export default function RyuzenCommandCenterOverlay() {
  const { commandCenterOpen, closeCommandCenter } = useUI();

  return (
    <AnimatePresence>
      {commandCenterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed inset-0 
            bg-black/40 
            backdrop-blur-3xl 
            flex justify-center items-center 
            z-50
          "
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="
              relative w-[92%] h-[84%] 
              bg-gradient-to-b from-[#0d1018] to-[#04060b]
              rounded-2xl border border-white/10 
              shadow-[0_20px_60px_rgba(0,0,0,0.8)]
              p-10 grid grid-cols-3 gap-6
              overflow-hidden
            "
          >
            <button
              aria-label="Close Command Center"
              onClick={closeCommandCenter}
              className="
                absolute top-5 right-6 
                text-white/40 hover:text-white
                transition z-[99]
              "
            >
              <X size={28} />
            </button>

            {panels.map((panel, index) => (
              <motion.div
                key={panel.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="
                  bg-gradient-to-br 
                  from-[#111827]/90 
                  to-[#0c1321]/90
                  border border-white/5 
                  rounded-xl 
                  p-6 shadow-lg
                  hover:shadow-2xl hover:-translate-y-1 transition
                "
              >
                <div className="text-xl font-semibold text-white">
                  {panel.title}
                </div>
                <div className="mt-2 text-white/60 text-sm">
                  {panel.body}
                </div>
              </motion.div>
            ))}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
