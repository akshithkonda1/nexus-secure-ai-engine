import { CompiledContext, SanitizedTraceSnapshot, ShapedContextMetadata } from "./types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const shapeContext = (
  compiled: CompiledContext,
  trace: SanitizedTraceSnapshot
): ShapedContextMetadata => {
  const emotionalTemperature = clamp(
    (trace.conversationMomentum + (trace.emotion.includes("calm") ? -0.1 : 0.1)),
    0,
    1
  );

  const structuralStyle: ShapedContextMetadata["structuralStyle"] =
    compiled.conversationPhase === "analysis"
      ? "tight"
      : compiled.conversationPhase === "exploration"
        ? "loose"
        : "balanced";

  const safetyBias = clamp(trace.safetyWeight + trace.hallucinationRisk * 0.5, 0, 1);
  const reasoning = clamp(0.6 + compiled.difficultyScore * 0.3, 0, 1);
  const creativity = clamp(0.4 + (1 - safetyBias) * 0.3, 0, 1);
  const brevity = clamp(0.5 + (structuralStyle === "tight" ? 0.2 : -0.1), 0, 1);
  const metaConfidence = clamp(0.5 + compiled.continuityScore * 0.4 - trace.hallucinationRisk * 0.3, 0, 1);

  return {
    llmHints: {
      reasoning,
      creativity,
      brevity,
    },
    emotionalTemperature,
    structuralStyle,
    safetyBias,
    metaConfidence,
  };
};
