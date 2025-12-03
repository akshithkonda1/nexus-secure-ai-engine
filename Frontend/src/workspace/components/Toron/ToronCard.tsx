import React from "react";
import { ToronCard as ToronCardType } from "../../state/toronStore";

export const ToronCard: React.FC<{ card: ToronCardType }> = ({ card }) => (
  <div className="rounded-xl border border-borderStrong bg-bgElevated p-4 shadow hover:shadow-lg transition">
    <div className="text-sm font-semibold text-textMuted">{card.title}</div>
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
