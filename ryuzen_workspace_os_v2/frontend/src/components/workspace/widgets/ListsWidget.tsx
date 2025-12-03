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
      className="w-full text-left"
      style={{
        background: "var(--rz-surface)",
        border: `1px solid var(--rz-border)`,
        color: "var(--rz-text)",
        backdropFilter: "blur(20px)",
        borderRadius: "var(--rz-radius)",
        boxShadow: `0 8px 24px var(--rz-shadow)` ,
        transition: `background var(--rz-duration), color var(--rz-duration), border var(--rz-duration)` ,
        padding: "16px",
        ...(active ? { background: "var(--rz-surface-glass)" } : {}),
      }}
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
