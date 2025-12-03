import React, { useState } from "react";
import { ToronMiniChat } from "../Toron/ToronMiniChat";
import { useNotificationsStore } from "../../state/notificationsStore";

export const WorkspaceBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { actionable } = useNotificationsStore();

  return (
    <div className="relative">
      <button
        className={`relative rounded-full bg-bgElevated px-4 py-2 text-sm font-medium text-textMuted ring-1 ring-neutral-700 transition hover:bg-bgElevated ${
          actionable.length ? "shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        Workspace Bell
        {actionable.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-textPrimary">
            {actionable.length}
          </span>
        )}
      </button>
      {open && (
        <div className="fade-in absolute right-0 mt-3 w-80 rounded-2xl bg-bgElevated/95 p-4 text-sm shadow-2xl ring-1 ring-neutral-800">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-textMuted">Consent-based actions</div>
          <ToronMiniChat onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};
