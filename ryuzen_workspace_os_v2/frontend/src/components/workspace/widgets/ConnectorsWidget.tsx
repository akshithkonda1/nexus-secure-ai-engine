import React from "react";

interface WidgetProps {
  active: boolean;
  onClick: () => void;
}

const ConnectorsWidget: React.FC<WidgetProps> = ({ active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-xl transition hover:bg-white/10 text-left min-w-[160px] ${
        active ? "bg-white/15" : "bg-white/5"
      }`}
    >
      <p className="text-sm text-white/80">Connectors</p>
      <p className="text-lg font-semibold text-white">Integrate</p>
    </button>
  );
};

export default ConnectorsWidget;
