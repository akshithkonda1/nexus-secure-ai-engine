import React from "react";
import { ToronCard as ToronCardType } from "../../state/toronStore";

export const ToronCard: React.FC<{ card: ToronCardType }> = ({ card }) => (
  <div
    className="relative bg-glass backdrop-blur-3xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.015] before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none"
  >
    <div className="text-sm font-semibold text-textPrimary">{card.title}</div>
    <p className="mt-2 text-sm text-textMuted">{card.reason}</p>
    <div className="mt-4 flex gap-2 text-sm">
      <button
        className="rounded-full bg-emerald-600 px-3 py-1 text-textPrimary transition hover:bg-emerald-500"
        onClick={() => card.onAccept?.(card.id)}
      >
        Accept
      </button>
      <button
        className="rounded-full border border-borderStrong px-3 py-1 text-textMuted transition hover:bg-bgElevated"
        onClick={() => card.onIgnore?.(card.id)}
      >
        Ignore
      </button>
      <button
        className="rounded-full border border-borderStrong px-3 py-1 text-textMuted transition hover:bg-bgElevated"
        onClick={() => card.onExplain?.(card.id)}
      >
        Explain
      </button>
    </div>
  </div>
);
