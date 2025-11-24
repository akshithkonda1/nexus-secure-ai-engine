import { IntentClassification, SanitizedTraceSnapshot } from "../context/types";

const sanitize = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[\w.-]+@[\w.-]+/g, "[redacted]")
    .replace(/\b\d{3,}\b/g, "[num]")
    .slice(0, 240);

const inferIntent = (input: string): string => {
  if (input.includes("error") || input.includes("issue")) return "support";
  if (input.includes("plan") || input.includes("strategy")) return "planning";
  if (input.includes("help") || input.includes("how")) return "guidance";
  if (input.includes("idea") || input.includes("brainstorm")) return "ideation";
  return "dialogue";
};

const inferEmotion = (input: string): string => {
  if (input.includes("thank")) return "appreciative";
  if (input.includes("frustrat") || input.includes("angry")) return "frustrated";
  if (input.includes("worried") || input.includes("concern")) return "concerned";
  return "neutral";
};

export const classifyIntent = (
  rawInput: string,
  trace?: SanitizedTraceSnapshot
): IntentClassification => {
  const sanitized = sanitize(rawInput);
  const intent = inferIntent(sanitized);
  const emotion = inferEmotion(sanitized);
  const confidenceBase = sanitized.split(/\s+/).filter(Boolean).length / 20;
  const confidence = Math.min(
    0.9,
    Math.max(0.3, confidenceBase + (trace ? trace.conversationMomentum * 0.2 : 0))
  );

  return {
    intent,
    confidence,
    emotion,
  };
};
