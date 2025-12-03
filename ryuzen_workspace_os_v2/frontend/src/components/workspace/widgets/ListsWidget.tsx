import React from "react";

interface WidgetProps {
  active: boolean;
  onClick: () => void;
}

const ListsWidget: React.FC<WidgetProps> = ({ active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl px-4 py-4 text-[var(--rz-text)] shadow-xl transition ${active ? "ring-2 ring-black/10 dark:ring-white/10" : ""}`}
    >
      <p className="text-sm text-[var(--rz-text)]">
        Lists
      </p>
      <p className="text-lg font-semibold text-[var(--rz-text)]">
        Organize
      </p>
    </button>
  );
};

export default ListsWidget;
