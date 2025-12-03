import React from "react";
import { ToronCard as ToronCardType } from "../../state/toronStore";

export const ToronCard: React.FC<{ card: ToronCardType }> = ({ card }) => (
  <div
    className="relative rounded-3xl bg-tile bg-tileGradient border border-tileBorder px-6 py-5 text-textSecondary shadow-tile before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:border-tileBorderStrong hover:shadow-tileStrong"
  >
    <div className="text-sm font-semibold text-textPrimary">{card.title}</div>
    <p className="mt-2 text-sm text-textMuted">{card.reason}</p>
    <div className="mt-4 flex gap-2 text-sm">
      <button
        className="rounded-full bg-emerald-600 px-3 py-1 text-textPrimary shadow-tile transition hover:bg-emerald-500"
        onClick={() => card.onAccept?.(card.id)}
      >
        Accept
      </button>
      <button
        className="rounded-full border border-tileBorder px-3 py-1 text-textMuted transition hover:border-tileBorderStrong"
        onClick={() => card.onIgnore?.(card.id)}
      >
        Ignore
      </button>
      <button
        className="rounded-full border border-tileBorder px-3 py-1 text-textMuted transition hover:border-tileBorderStrong"
        onClick={() => card.onExplain?.(card.id)}
      >
        Explain
      </button>
    </div>
  </div>
);
