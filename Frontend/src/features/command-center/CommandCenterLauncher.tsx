import React from "react";
import { Network } from "lucide-react";

import { CommandCenter } from "@/features/command-center/CommandCenter";

export function CommandCenterLauncher() {
  const [open, setOpen] = React.useState(false);
  const notifications = 3; // TODO: wire to real count later

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.6)] bg-[rgba(var(--panel),0.9)] px-3 py-1.5 text-xs font-semibold text-[rgba(var(--subtle),0.9)] shadow-[0_0_22px_rgba(0,0,0,0.4)] transition hover:border-[rgba(var(--brand),0.7)] hover:text-[rgb(var(--text))]"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <span className="absolute h-6 w-6 animate-[pulse_3s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,_rgba(var(--accent-emerald),0.7),_transparent_70%)] opacity-70" />
          <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(var(--accent-emerald),0.2)]">
            <Network className="size-3 text-[rgb(var(--accent-emerald))]" />
          </span>
        </span>
        <span>Command Center</span>
        {notifications > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[rgb(var(--status-critical))] px-1 text-[10px] font-semibold text-[rgb(var(--on-accent))]">
            {notifications}
          </span>
        )}
      </button>

      <CommandCenter isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
