import React from "react";
import { motion } from "framer-motion";

interface ConnectorsWidgetProps {
  active?: boolean;
  onClick?: () => void;
}

const ConnectorsWidget: React.FC<ConnectorsWidgetProps> = ({ active, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition ${
        active ? "bg-white/20 shadow-xl" : "hover:bg-white/10"
      }`}
    >
      <div>
        <div className="text-sm text-white/60">Connectors</div>
        <div className="text-lg font-semibold">Live sync</div>
      </div>
      <span className="ml-auto text-xl">🔗</span>
    </motion.button>
  );
};

export default ConnectorsWidget;
