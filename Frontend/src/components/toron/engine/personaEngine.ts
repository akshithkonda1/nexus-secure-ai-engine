import { CompiledContext, PersonaProfile, ShapedContextMetadata } from "../context/types";

export const defaultPersona: PersonaProfile = {
  name: "Toron Core",
  tone: "balanced",
  agility: 0.6,
  empathy: 0.7,
  riskTolerance: 0.3,
  continuityAffinity: 0.5,
};

export const evolvePersona = (
  persona: PersonaProfile,
  compiled: CompiledContext,
  shaped: ShapedContextMetadata
): PersonaProfile => {
  const continuityAffinity = Math.min(1, Math.max(0, compiled.continuityScore * 0.8 + 0.2));
  const agility = Math.min(1, Math.max(0.4, persona.agility * 0.9 + shaped.llmHints.reasoning * 0.2));
  const empathy = Math.min(1, Math.max(0.4, persona.empathy * 0.85 + shaped.emotionalTemperature * 0.3));
  const riskTolerance = Math.min(1, Math.max(0, persona.riskTolerance * 0.8 + (1 - shaped.safetyBias) * 0.2));

  const tone = compiled.conversationPhase === "analysis" ? "analytical" : compiled.conversationPhase === "resolution" ? "concise" : "curious";

  return {
    ...persona,
    tone,
    continuityAffinity,
    agility,
    empathy,
    riskTolerance,
  };
};
