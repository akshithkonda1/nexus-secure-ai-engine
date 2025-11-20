import React, { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { X } from "lucide-react";

import { useSession } from "@/shared/state/session";

import { ConnectorEcosystemsCard } from "./ConnectorEcosystemsCard";
import { DataTransformerCard } from "./DataTransformerCard";
import { RyuzenAlertsCard } from "./RyuzenAlertsCard";
import { RyuzenContinueTile } from "./RyuzenContinueTile";
import { RyuzenQuickActionsCard } from "./RyuzenQuickActionsCard";
import { RyuzenSystemCard } from "./RyuzenSystemCard";
import { ToronEngineCard } from "./ToronEngineCard";
import { ToronNeuralCoreHero } from "./ToronNeuralCoreHero";

interface RyuzenCommandCenterOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function RyuzenCommandCenterOverlay({ open, onClose }: RyuzenCommandCenterOverlayProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const { user } = useSession();

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-3xl"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-aurora-edge opacity-60 blur-3xl" />
      <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-8">
        <Draggable
          nodeRef={nodeRef}
          handle=".ryuzen-drag-handle"
          bounds="parent"
          defaultPosition={{ x: 0, y: 0 }}
        >
          <div
            ref={nodeRef}
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-[0_0_60px_rgba(56,189,248,0.25)] backdrop-blur-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-aurora-edge" />
            <div className="relative space-y-6 p-6 lg:p-8">
              <header className="ryuzen-drag-handle flex cursor-move items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200">Nimbus Command Center</p>
                  <h1 className="mt-2 text-2xl font-semibold text-white">Hello, {user?.name ?? "Operator"}</h1>
                  <p className="mt-1 text-sm text-slate-200">
                    Glassy, draggable system overview with holographic Toron core and neon controls.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close command center"
                  onClick={onClose}
                  className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-cyan-400/50 hover:bg-cyan-500/15"
                >
                  <X className="h-5 w-5 transition group-hover:rotate-90" />
                </button>
              </header>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4">
                  <RyuzenSystemCard />
                  <ToronEngineCard />
                  <DataTransformerCard />
                  <ConnectorEcosystemsCard />
                </div>

                <div>
                  <ToronNeuralCoreHero />
                </div>

                <div className="space-y-4">
                  <RyuzenAlertsCard />
                  <RyuzenQuickActionsCard />
                  <RyuzenContinueTile />
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  );
}
