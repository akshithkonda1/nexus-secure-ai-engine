import React, { useState } from "react";
import { useNotificationsStore } from "../../state/notificationsStore";

export const SystemBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { insights } = useNotificationsStore();

  return (
    <div className="relative">
      <button
        className="rounded-full border border-tileBorder bg-tileStrong px-4 py-2 text-sm font-medium text-textSecondary shadow-tile transition hover:border-tileBorderStrong hover:shadow-tileStrong"
        onClick={() => setOpen((prev) => !prev)}
      >
        System Bell
      </button>
      {open && (
        <div className="fade-in absolute right-0 mt-3 w-72 rounded-2xl border border-tileBorder bg-tile bg-tileGradient p-4 text-sm text-textSecondary shadow-tile before:absolute before:inset-0 before:rounded-2xl before:bg-tileInner before:content-[''] before:pointer-events-none relative">
          <div className="text-xs uppercase tracking-[0.2em] text-textSecondary">Insights only</div>
          <ul className="mt-3 space-y-2 text-textMuted">
            {insights.length === 0 && <li className="text-textSecondary">No insights yet.</li>}
            {insights.map((item) => (
              <li key={item.id} className="rounded-xl bg-tileStrong border border-tileBorder p-3 text-sm shadow-tile">
                <p className="font-medium text-textPrimary">{item.title}</p>
                <p className="text-xs text-textMuted">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
