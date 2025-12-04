import React from "react";
import { ToronCard as ToronCardType } from "../../state/toronStore";

export const ToronCard: React.FC<{ card: ToronCardType }> = ({ card }) => (
  <div
    className="relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 px-6 py-5 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]"
  >
    <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{card.title}</div>
    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{card.reason}</p>
    <div className="mt-4 flex gap-2 text-sm">
      <button
        className="rounded-full bg-emerald-600 px-3 py-1 text-neutral-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition hover:bg-emerald-500"
        onClick={() => card.onAccept?.(card.id)}
      >
        Accept
      </button>
      <button
        className="rounded-full border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-1 text-neutral-800 dark:text-neutral-200 transition hover:border-neutral-400/70 dark:hover:border-neutral-500/70"
        onClick={() => card.onIgnore?.(card.id)}
      >
        Ignore
      </button>
      <button
        className="rounded-full border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-1 text-neutral-800 dark:text-neutral-200 transition hover:border-neutral-400/70 dark:hover:border-neutral-500/70"
        onClick={() => card.onExplain?.(card.id)}
      >
        Explain
      </button>
    </div>
  </div>
);
