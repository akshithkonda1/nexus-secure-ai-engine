import React from "react";
import { useModeStore } from "../../state/modeStore";

export const ModeSwitch: React.FC = () => {
  const { mode, toggleMode } = useModeStore();
  const isAdvanced = mode === "advanced";

  return (
    <button
      aria-label="Toggle workspace mode"
      onClick={toggleMode}
      className={`relative flex h-10 w-20 items-center rounded-full border border-tileBorder bg-tileStrong p-1 shadow-tile transition duration-[var(--switch-slide)] ease-linear ${
        isAdvanced ? "justify-end" : "justify-start"
      }`}
    >
      <span
        className={`h-8 w-8 rounded-full border border-tileBorder bg-tile shadow-tile transition duration-[var(--switch-bounce)] ${
          isAdvanced ? "translate-x-0 bg-emerald-500" : "translate-x-0"
        }`}
      />
      <span className="sr-only">{isAdvanced ? "Advanced mode" : "Basic mode"}</span>
    </button>
  );
};
