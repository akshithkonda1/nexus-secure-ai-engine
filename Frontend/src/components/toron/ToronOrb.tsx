import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ToronStageState } from "../../state/useToron";

export interface ToronOrbProps {
  state: ToronStageState;
  stageLabel?: string | null;
  progress?: number | null;
}

const STATE_COPY: Record<ToronStageState, string> = {
  idle: "Ready",
  processing: "Analyzing",
  escalation: "Escalating",
  disagreement: "Reconciling",
  consensus: "Complete",
  error: "Recovering",
};

const ToronOrb: React.FC<ToronOrbProps> = ({ state, stageLabel, progress }) => {
  const prefersReducedMotion = useReducedMotion();
  const [held, setHeld] = useState(false);

  const haloScale = useMemo(() => {
    if (held) return 1.02;
    if (state === "processing") return 1.04;
    if (state === "consensus") return 1.01;
    if (state === "error") return 0.98;
    return 1;
  }, [held, state]);

  const coreScale = useMemo(() => {
    if (held) return 1.06;
    if (state === "processing") return 1.02;
    if (state === "escalation") return 1.04;
    if (state === "disagreement") return 1.01;
    if (state === "error") return 0.96;
    return 1;
  }, [held, state]);

  const caption = stageLabel || STATE_COPY[state];

  return (
    <div className={`toron-orb-shell state-${state}${held ? " held" : ""}`}>
      <motion.div
        className="toron-orb"
        onMouseDown={() => setHeld(true)}
        onMouseUp={() => setHeld(false)}
        onMouseLeave={() => setHeld(false)}
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
        whileTap={{ scale: prefersReducedMotion ? 1 : 1.05 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="toron-orb-core"
          animate={{ scale: prefersReducedMotion ? 1 : coreScale }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.div
          className="toron-orb-field"
          animate={{ scale: prefersReducedMotion ? 1 : haloScale }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.div
          className="toron-orb-halo"
          animate={{ opacity: state === "error" ? 0.5 : 0.9 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <div className="toron-orb-overlay">
          <div className="toron-orb-energy" aria-hidden />
          <div className="toron-orb-energy alt" aria-hidden />
        </div>
      </motion.div>
      <div className="toron-orb-caption" aria-live="polite">
        <span className="toron-orb-stage">{caption}</span>
        {progress !== null && progress !== undefined && (
          <span className="toron-orb-progress">{Math.round(progress * 100)}%</span>
        )}
      </div>
    </div>
  );
};

export default ToronOrb;
