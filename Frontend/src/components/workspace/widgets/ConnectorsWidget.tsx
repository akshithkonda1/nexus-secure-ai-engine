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
      className={`min-w-[200px] px-4 py-3 rounded-2xl border backdrop-blur-xl text-left shadow-lg transition-colors flex items-center justify-between gap-3 ${active ? 'bg-bgPrimary/20 border-borderLight/30' : 'bg-bgPrimary/10 border-borderLight/20 hover:bg-bgPrimary/15'}`}
    >
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-textPrimary/60">Connectors</div>
        <div className="font-semibold text-textPrimary">Link your tools</div>
      </div>
      <div className="h-10 w-10 rounded-xl bg-bgPrimary/10 flex items-center justify-center text-textPrimary/80">🔗</div>
    </motion.button>
  );
};

export default ConnectorsWidget;
