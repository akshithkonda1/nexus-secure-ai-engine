import ToronPanel from "@/components/common/ToronPanel";
import ToronGrid from "@/components/command-center/ToronGrid";
import { X } from "lucide-react";

export default function RyuzenCommandCenterOverlay({ onClose }) {
  return (
    <div
      className="
        fixed inset-0 bg-black/40 backdrop-blur-3xl
        flex justify-center items-center p-4 z-50
      "
    >
      <div
        className="
          relative w-[95%] h-[85%]
          bg-gradient-to-b from-[#0b0f17]/70 to-[#03050a]/70
          rounded-2xl border border-white/10
          shadow-[0_20px_60px_rgba(0,0,0,0.8)]
          overflow-hidden
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 text-white/40
            hover:text-white/90 transition z-[99]
          "
        >
          <X size={24} />
        </button>

        <ToronGrid>

          <ToronPanel>
            <div className="text-white text-xl font-semibold">Neural Load</div>
            <div className="text-white/60">4 active models</div>
          </ToronPanel>

          <ToronPanel>
            <div className="text-white text-xl font-semibold">Pipelines</div>
            <div className="text-white/60">Transformer 98.4%</div>
          </ToronPanel>

          <ToronPanel>
            <div className="text-white text-xl font-semibold">Connectors</div>
            <div className="text-white/60">8 linked</div>
          </ToronPanel>

          <ToronPanel>
            <div className="text-white text-xl font-semibold">Workspace</div>
            <div className="text-white/60">Hologram jump</div>
          </ToronPanel>

          <ToronPanel>
            <div className="text-white text-xl font-semibold">Telemetry</div>
            <div className="text-white/60">Live monitoring</div>
          </ToronPanel>

          <ToronPanel className="bg-gradient-to-br from-[#102037]/80 to-[#091629]/80">
            <div className="text-white text-lg font-semibold">
              Resume Analysis: Project Ryuzen
            </div>
            <div className="text-white/60">
              Toron paused on node clustering.
            </div>

            <button
              className="
                mt-3 w-fit px-4 py-2 rounded-md
                bg-cyan-500/20 text-cyan-300
                border border-cyan-400/20
                hover:bg-cyan-500/30 transition
              "
            >
              Continue →
            </button>
          </ToronPanel>

        </ToronGrid>
      </div>
    </div>
  );
}
