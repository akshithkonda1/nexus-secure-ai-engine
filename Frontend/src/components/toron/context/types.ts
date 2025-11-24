export type ToronRole = "user" | "assistant";

export interface ContextWindowEntry {
  role: ToronRole;
  intent: string;
  emotion: string;
  meaningVector: number[];
  summary: string;
  timestamp: number;
}

export interface SanitizedTraceSnapshot {
  intent: string;
  emotion: string;
  topic: string;
  conversationMomentum: number;
  safetyWeight: number;
  hallucinationRisk: number;
  llmAgreement: number;
  lastUpdated: number;
}

export interface CompiledContext {
  semanticContext: string;
  conversationPhase: "exploration" | "analysis" | "resolution";
  difficultyScore: number;
  continuityScore: number;
}

export interface ShapedContextMetadata {
  llmHints: { reasoning: number; creativity: number; brevity: number };
  emotionalTemperature: number;
  structuralStyle: "tight" | "loose" | "balanced";
  safetyBias: number;
  metaConfidence: number;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  emotion: string;
}

export interface PersonaProfile {
  name: string;
  tone: string;
  agility: number;
  empathy: number;
  riskTolerance: number;
  continuityAffinity: number;
}

export interface ToronState {
  stage: "exploration" | "analysis" | "resolution";
  stability: number;
  lastIntent?: string;
}

export interface ContextBundle {
  currentContext: CompiledContext;
  metadataForVisualizer: ShapedContextMetadata & {
    trace: SanitizedTraceSnapshot;
    windowSize: number;
    semanticDensity: number;
  };
  metadataForLLM: ShapedContextMetadata;
  persona: PersonaProfile;
  state: ToronState;
}
