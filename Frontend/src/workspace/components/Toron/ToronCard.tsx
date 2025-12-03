import React from "react";
import { ToronCard as ToronCardType } from "../../state/toronStore";

export const ToronCard: React.FC<{ card: ToronCardType }> = ({ card }) => (
  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow hover:shadow-lg transition">
    <div className="text-sm font-semibold text-neutral-100">{card.title}</div>
    <p className="mt-2 text-sm text-neutral-300">{card.reason}</p>
    <div className="mt-4 flex gap-2 text-sm">
      <button
        className="rounded-full bg-emerald-600 px-3 py-1 text-white transition hover:bg-emerald-500"
        onClick={() => card.onAccept?.(card.id)}
      >
        Accept
      </button>
      <button
        className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-200 transition hover:bg-neutral-800"
        onClick={() => card.onIgnore?.(card.id)}
      >
        Ignore
      </button>
      <button
        className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-200 transition hover:bg-neutral-800"
        onClick={() => card.onExplain?.(card.id)}
      >
        Explain
      </button>
    </div>
  </div>
);
