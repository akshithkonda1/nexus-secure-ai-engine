import React from "react";
import { useToronStore } from "../../state/toronStore";
import { ToronCard } from "./ToronCard";

export const ToronModal: React.FC = () => {
  const { isModalOpen, closeToron, cards } = useToronStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgElevated/70" onClick={closeToron}>
      <div
        className="fade-in max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-bgElevated/90 p-6 shadow-2xl ring-1 ring-neutral-800"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-textMuted">Toron</p>
            <h2 className="text-xl font-semibold text-textMuted">Reasoning-backed insights</h2>
          </div>
          <button className="text-sm text-textMuted hover:text-textMuted" onClick={closeToron}>
            Close
          </button>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <ToronCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};
