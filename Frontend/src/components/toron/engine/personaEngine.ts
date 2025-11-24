import { IntentClassification, PersonaProfile, ToronPersona, clamp } from "./types";

const personaTone: Record<ToronPersona, string> = {
  direct: "succinct and actionable",
  analytical: "methodical and clear",
  creative: "imaginative and fluid",
  empathetic: "supportive and warm",
  technical: "precise and detailed",
  neutral: "grounded and balanced",
};

const personaBias: Record<ToronPersona, PersonaProfile["visualBias"]> = {
  direct: { colorBoost: 0.4, waveformEnergy: 0.65, resonanceShift: 0.45 },
  analytical: { colorBoost: 0.35, waveformEnergy: 0.55, resonanceShift: 0.5 },
  creative: { colorBoost: 0.6, waveformEnergy: 0.7, resonanceShift: 0.65 },
  empathetic: { colorBoost: 0.55, waveformEnergy: 0.45, resonanceShift: 0.35 },
  technical: { colorBoost: 0.3, waveformEnergy: 0.6, resonanceShift: 0.7 },
  neutral: { colorBoost: 0.25, waveformEnergy: 0.4, resonanceShift: 0.4 },
};

export const derivePersona = (classification: IntentClassification): PersonaProfile => {
  const { intent, emotion, complexity } = classification;
  let persona: ToronPersona = "neutral";

  if (intent === "command") {
    persona = "direct";
  } else if (intent === "technical" || complexity > 0.65) {
    persona = "technical";
  } else if (intent === "question" || intent === "analysis") {
    persona = "analytical";
  } else if (intent === "creative") {
    persona = "creative";
  } else if (intent === "emotional") {
    persona = "empathetic";
  }

  if (emotion === "negative") {
    persona = "empathetic";
  } else if (emotion === "positive" && persona === "neutral") {
    persona = "creative";
  }

  const tone = personaTone[persona];
  const visualBias = personaBias[persona];

  return {
    persona,
    tone,
    visualBias: {
      colorBoost: clamp(visualBias.colorBoost),
      waveformEnergy: clamp(visualBias.waveformEnergy),
      resonanceShift: clamp(visualBias.resonanceShift),
    },
  };
};

export default derivePersona;
