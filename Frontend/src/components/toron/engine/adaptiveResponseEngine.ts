import {
  CompiledContext,
  SanitizedTraceSnapshot,
  ShapedContextMetadata,
} from "../context/types";

export interface AdaptivePlan {
  pacing: "slow" | "normal" | "fast";
  guardrails: number;
  style: string;
  escalation: boolean;
}

export const buildAdaptivePlan = (
  compiled: CompiledContext,
  shaped: ShapedContextMetadata,
  trace: SanitizedTraceSnapshot
): AdaptivePlan => {
  const pacing: AdaptivePlan["pacing"] =
    compiled.difficultyScore > 0.7 ? "slow" : compiled.continuityScore > 0.6 ? "normal" : "fast";

  const guardrails = Math.min(1, shaped.safetyBias + trace.hallucinationRisk * 0.4);
  const escalation = guardrails > 0.8;
  const style = `${shaped.structuralStyle}-${shaped.llmHints.reasoning > 0.7 ? "structured" : "light"}`;

  return {
    pacing,
    guardrails,
    style,
    escalation,
  };
};
