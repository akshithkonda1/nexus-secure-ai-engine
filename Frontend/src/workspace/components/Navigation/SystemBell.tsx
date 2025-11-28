import React, { useState } from "react";
import { useNotificationsStore } from "../../state/notificationsStore";

export const SystemBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { insights } = useNotificationsStore();

  return (
    <div className="relative">
      <button
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 ring-1 ring-neutral-700 transition hover:bg-neutral-800"
        onClick={() => setOpen((prev) => !prev)}
      >
        System Bell
      </button>
      {open && (
        <div className="fade-in absolute right-0 mt-3 w-72 rounded-2xl bg-neutral-900/95 p-4 text-sm shadow-2xl ring-1 ring-neutral-800">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">Insights only</div>
          <ul className="mt-3 space-y-2 text-neutral-200">
            {insights.length === 0 && <li className="text-neutral-500">No insights yet.</li>}
            {insights.map((item) => (
              <li key={item.id} className="rounded-lg bg-neutral-800/60 p-3 text-sm">
                <p className="font-medium text-neutral-100">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
