import React from "react";
import { useToronStore } from "../../state/toronStore";
import { ToronCard } from "./ToronCard";

export const ToronModal: React.FC = () => {
  const { isModalOpen, closeToron, cards } = useToronStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={closeToron}>
      <div
        className="fade-in relative max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 p-6 text-neutral-800 dark:text-neutral-200 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-600 dark:text-neutral-300">Toron</p>
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Reasoning-backed insights</h2>
          </div>
          <button className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100" onClick={closeToron}>
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
