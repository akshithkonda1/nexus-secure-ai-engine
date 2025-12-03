import React, { useState } from "react";
import { ToronMiniChat } from "../Toron/ToronMiniChat";
import { useNotificationsStore } from "../../state/notificationsStore";

export const WorkspaceBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { actionable } = useNotificationsStore();

  return (
    <div className="relative">
      <button
        className={`relative rounded-full border border-tileBorder bg-tileStrong px-4 py-2 text-sm font-medium text-textSecondary shadow-tile transition hover:border-tileBorderStrong hover:shadow-tileStrong ${
          actionable.length ? "shadow-[0_0_0_6px_rgba(16,185,129,0.25)]" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
      >
        Workspace Bell
        {actionable.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-textPrimary shadow-tile">
            {actionable.length}
          </span>
        )}
      </button>
      {open && (
        <div className="fade-in absolute right-0 mt-3 w-80 rounded-2xl border border-tileBorder bg-tile bg-tileGradient p-4 text-sm text-textSecondary shadow-tile before:absolute before:inset-0 before:rounded-2xl before:bg-tileInner before:content-[''] before:pointer-events-none relative">
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-textSecondary">Consent-based actions</div>
          <ToronMiniChat onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};
