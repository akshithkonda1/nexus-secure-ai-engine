import { FC, useMemo } from "react";
import {
  CompiledContext,
  PersonaProfile,
  SanitizedTraceSnapshot,
  ShapedContextMetadata,
  ToronState,
} from "./context/types";

interface ToronVisualizerProps {
  compiled: CompiledContext;
  metadata: ShapedContextMetadata & {
    trace: SanitizedTraceSnapshot;
    windowSize: number;
    semanticDensity: number;
  };
  persona: PersonaProfile;
  state: ToronState;
}

export const ToronVisualizer: FC<ToronVisualizerProps> = ({
  compiled,
  metadata,
  persona,
  state,
}) => {
  const pulse = useMemo(() => 40 + metadata.emotionalTemperature * 60, [metadata.emotionalTemperature]);
  const continuity = useMemo(
    () => Math.round(compiled.continuityScore * 100),
    [compiled.continuityScore]
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Toron Context Pulse
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{pulse.toFixed(0)}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Persona</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{persona.tone}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200">
        <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Conversation Phase</p>
          <p className="font-semibold capitalize">{compiled.conversationPhase}</p>
        </div>
        <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Continuity</p>
          <p className="font-semibold">{continuity}%</p>
        </div>
        <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Difficulty</p>
          <p className="font-semibold">{(compiled.difficultyScore * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-lg bg-white/60 p-3 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Safety Bias</p>
          <p className="font-semibold">{(metadata.safetyBias * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800/80">
          <p className="text-[11px] uppercase tracking-wide">Momentum</p>
          <p className="text-sm font-semibold">{(metadata.trace.conversationMomentum * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800/80">
          <p className="text-[11px] uppercase tracking-wide">Window</p>
          <p className="text-sm font-semibold">{metadata.windowSize} slots</p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800/80">
          <p className="text-[11px] uppercase tracking-wide">Density</p>
          <p className="text-sm font-semibold">{(metadata.semanticDensity * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Stability: {(state.stability * 100).toFixed(0)}%</span>
        <span>LLM Confidence: {(metadata.metaConfidence * 100).toFixed(0)}%</span>
        <span>Guard: {(metadata.trace.hallucinationRisk * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
