import React from 'react';
import { motion } from 'framer-motion';

interface ConnectorsWidgetProps {
  active?: boolean;
  onClick?: () => void;
}

const ConnectorsWidget: React.FC<ConnectorsWidgetProps> = ({ active, onClick }) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`min-w-[200px] px-4 py-3 rounded-2xl border backdrop-blur-xl text-left shadow-lg transition-colors flex items-center justify-between gap-3 ${active ? 'bg-white/20 border-white/30' : 'bg-white/10 border-white/20 hover:bg-white/15'}`}
    >
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/60">Connectors</div>
        <div className="font-semibold text-white">Link your tools</div>
      </div>
      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80">🔗</div>
    </motion.button>
  );
};

export default ConnectorsWidget;
