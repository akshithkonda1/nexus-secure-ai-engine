export type ToronContextState = {
  persona: string;
  reasoningHints: string[];
  continuityScore: number;
  difficultyScore: number;
  topicTags: string[];
};

const REDACTION = "[sanitized]";
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const sanitizeText = (value: string) => {
  const trimmed = normalize(value || "");
  if (!trimmed) return "";
  return trimmed
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTION)
    .replace(/\+?\d[\d\s().-]{8,}\d/g, REDACTION)
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, REDACTION)
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, REDACTION)
    .slice(0, 240);
};

const clampScore = (value: number | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

const defaultContext = (): ToronContextState => ({
  persona: "toron-neutral",
  reasoningHints: [],
  continuityScore: 0.5,
  difficultyScore: 0.4,
  topicTags: [],
});

const sanitizeContext = (partial: Partial<ToronContextState> | undefined): ToronContextState => ({
  persona: sanitizeText(partial?.persona ?? defaultContext().persona),
  reasoningHints: Array.isArray(partial?.reasoningHints)
    ? partial!.reasoningHints.map((hint) => sanitizeText(hint)).filter(Boolean)
    : [],
  continuityScore: clampScore(partial?.continuityScore ?? defaultContext().continuityScore),
  difficultyScore: clampScore(partial?.difficultyScore ?? defaultContext().difficultyScore),
  topicTags: Array.isArray(partial?.topicTags)
    ? partial!.topicTags.map((tag) => sanitizeText(tag)).filter(Boolean)
    : [],
});

let ephemeralContext: ToronContextState = defaultContext();

export const contextMediator = {
  getEphemeral(): ToronContextState {
    return { ...ephemeralContext };
  },
  setEphemeral(partial: Partial<ToronContextState>): ToronContextState {
    ephemeralContext = sanitizeContext({ ...ephemeralContext, ...partial });
    return ephemeralContext;
  },
  reset(): ToronContextState {
    ephemeralContext = defaultContext();
    return ephemeralContext;
  },
};

export function loadProjectContext(
  projectId: string,
  state?: Partial<ToronContextState>,
): ToronContextState {
  void projectId;
  ephemeralContext = sanitizeContext(state ?? defaultContext());
  return ephemeralContext;
}

export async function saveProjectContext(
  projectId: string,
  persist?: (state: ToronContextState) => Promise<void>,
): Promise<ToronContextState> {
  void projectId;
  const snapshot = sanitizeContext(ephemeralContext);
  if (persist) {
    await persist(snapshot);
  }
  return snapshot;
}

export function resetEphemeralContext(): ToronContextState {
  ephemeralContext = defaultContext();
  return ephemeralContext;
}
