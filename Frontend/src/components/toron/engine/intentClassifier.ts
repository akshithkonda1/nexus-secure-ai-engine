import {
  IntentClassification,
  ToronBackendMetadata,
  ToronEmotion,
  ToronIntent,
  clamp,
} from "./types";

const interrogatives = new Set([
  "what",
  "how",
  "why",
  "where",
  "who",
  "when",
  "which",
]);

const imperatives = new Set([
  "do",
  "make",
  "build",
  "fix",
  "create",
  "generate",
  "explain",
  "tell",
  "show",
  "solve",
]);

const emotionalWords = new Set([
  "sad",
  "angry",
  "upset",
  "frustrated",
  "love",
  "hate",
  "scared",
  "worried",
  "excited",
  "happy",
]);

const positiveEmotion = new Set(["love", "excited", "happy", "appreciate", "glad"]);
const negativeEmotion = new Set([
  "sad",
  "angry",
  "upset",
  "frustrated",
  "hate",
  "scared",
  "worried",
]);

const creativeWords = new Set([
  "story",
  "character",
  "dragon",
  "galaxy",
  "dream",
  "poem",
  "song",
  "imagine",
  "fantasy",
  "legend",
]);

const technicalTokens = [
  "::",
  "();",
  "<",
  ">",
  "{",
  "}",
  "=",
  "`",
  "//",
  "#",
  "&&",
  "||",
  "function",
  "class",
  "const",
  "let",
];

const computeDensity = (tokens: string[], bucket: Set<string>): number => {
  if (!tokens.length) return 0;
  const hits = tokens.reduce((acc, token) => (bucket.has(token) ? acc + 1 : acc), 0);
  return hits / tokens.length;
};

const computeSymbolDensity = (message: string): number => {
  if (!message.length) return 0;
  const hits = technicalTokens.reduce(
    (score, token) => score + (message.includes(token) ? token.length : 0),
    0,
  );
  return clamp(hits / Math.max(message.length, 1));
};

const detectEmotion = (tokens: string[], density: number): ToronEmotion => {
  if (density === 0) return "neutral";
  const positives = tokens.filter((token) => positiveEmotion.has(token)).length;
  const negatives = tokens.filter((token) => negativeEmotion.has(token)).length;

  if (positives > negatives && density > 0.05) return "positive";
  if (negatives > positives && density > 0.05) return "negative";
  if (density > 0.1 && positives === negatives) return "confused";
  if (positives > 0 && density > 0.1) return "excited";
  return "neutral";
};

const pickIntent = (
  interrogativeDensity: number,
  imperativeDensity: number,
  emotionalDensity: number,
  technicalDensity: number,
  creativeDensity: number,
): ToronIntent => {
  const scores: Record<ToronIntent, number> = {
    question: interrogativeDensity,
    command: imperativeDensity,
    emotional: emotionalDensity,
    technical: technicalDensity,
    creative: creativeDensity,
    analysis: (interrogativeDensity + technicalDensity) / 2,
    system: 0,
    other: 0,
  };

  const strongest = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const [intent, value] = strongest;
  if (value < 0.05) {
    return interrogativeDensity > 0.02 ? "question" : "other";
  }
  if (intent === "analysis" && technicalDensity > 0.15) return "technical";
  return intent as ToronIntent;
};

const computeUrgency = (message: string, emotionalDensity: number): number => {
  const exclamations = (message.match(/!/g) || []).length;
  const capsRatio = message.length
    ? message.replace(/[^A-Z]/g, "").length / message.length
    : 0;
  return clamp(emotionalDensity * 0.4 + capsRatio * 0.4 + Math.min(exclamations / 5, 0.3));
};

const computeComplexity = (
  message: string,
  technicalDensity: number,
  creativeDensity: number,
  backendMetadata?: ToronBackendMetadata,
): number => {
  const lengthScore = clamp(message.split(/\s+/).filter(Boolean).length / 40);
  const punctuationScore = clamp((message.match(/[;,.:]/g) || []).length / 20);
  const metadataHint = clamp(backendMetadata?.complexityHint ?? 0);
  return clamp(lengthScore * 0.4 + punctuationScore * 0.2 + technicalDensity * 0.2 + creativeDensity * 0.1 + metadataHint * 0.1);
};

export const classifyIntent = (
  message: string,
  backendMetadata?: ToronBackendMetadata,
): IntentClassification => {
  const normalized = message.toLowerCase();
  const tokens = normalized.split(/[^a-zA-Z]+/).filter(Boolean);

  const interrogativeDensity = computeDensity(tokens, interrogatives);
  const imperativeDensity = computeDensity(tokens, imperatives);
  const emotionalDensity = computeDensity(tokens, emotionalWords);
  const technicalDensity = computeSymbolDensity(normalized);
  const creativeDensity = computeDensity(tokens, creativeWords);

  const intent = pickIntent(
    interrogativeDensity,
    imperativeDensity,
    emotionalDensity,
    technicalDensity,
    creativeDensity,
  );
  const emotion = detectEmotion(tokens, emotionalDensity);
  const urgency = computeUrgency(message, emotionalDensity);
  const complexity = computeComplexity(message, technicalDensity, creativeDensity, backendMetadata);

  return {
    intent,
    emotion,
    urgency,
    complexity,
    interrogativeDensity,
    imperativeDensity,
    emotionalDensity,
    technicalDensity,
    creativeDensity,
  };
};

export default classifyIntent;
