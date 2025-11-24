import { SanitizedTraceSnapshot } from "./types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const scrub = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\w.-]+@[\w.-]+/g, "[redacted]")
    .replace(/\b\d{3,}\b/g, "[num]")
    .slice(0, 120);

export class ToronSanitizedTrace {
  private trace: SanitizedTraceSnapshot = {
    intent: "",
    emotion: "neutral",
    topic: "general",
    conversationMomentum: 0.1,
    safetyWeight: 0.5,
    hallucinationRisk: 0.1,
    llmAgreement: 0.5,
    lastUpdated: Date.now(),
  };

  updateTrace({
    intent,
    emotion,
    topic,
    llmAgreement,
  }: Partial<Pick<SanitizedTraceSnapshot, "intent" | "emotion" | "topic" | "llmAgreement">>): SanitizedTraceSnapshot {
    const momentumBoost = intent || topic ? 0.08 : 0.02;
    this.trace = {
      ...this.trace,
      intent: intent ? scrub(intent) : this.trace.intent,
      emotion: emotion ? scrub(emotion) : this.trace.emotion,
      topic: topic ? scrub(topic) : this.trace.topic,
      conversationMomentum: clamp(
        this.trace.conversationMomentum * 0.85 + momentumBoost,
        0,
        1
      ),
      safetyWeight: clamp(
        0.4 + (topic ? topic.length / 200 : 0) + this.trace.hallucinationRisk * 0.3,
        0,
        1
      ),
      hallucinationRisk: clamp(
        this.trace.hallucinationRisk * 0.75 + (llmAgreement ? 0.05 : 0.02),
        0,
        1
      ),
      llmAgreement: clamp(
        llmAgreement ?? this.trace.llmAgreement * 0.95,
        0,
        1
      ),
      lastUpdated: Date.now(),
    };

    return this.getSnapshot();
  }

  decay(): SanitizedTraceSnapshot {
    this.trace = {
      ...this.trace,
      conversationMomentum: clamp(this.trace.conversationMomentum * 0.92, 0, 1),
      safetyWeight: clamp(this.trace.safetyWeight * 0.97, 0, 1),
      hallucinationRisk: clamp(this.trace.hallucinationRisk * 0.9, 0, 1),
      llmAgreement: clamp(this.trace.llmAgreement * 0.98, 0, 1),
      lastUpdated: Date.now(),
    };
    return this.getSnapshot();
  }

  wipe(): void {
    this.trace = {
      intent: "",
      emotion: "neutral",
      topic: "general",
      conversationMomentum: 0.1,
      safetyWeight: 0.5,
      hallucinationRisk: 0.1,
      llmAgreement: 0.5,
      lastUpdated: Date.now(),
    };
  }

  getSnapshot(): SanitizedTraceSnapshot {
    return { ...this.trace };
  }
}
