export type ModeKey = "student" | "business" | "nexusos";

export type AccentMap = Record<ModeKey, string>;

export const DEFAULT_ACCENTS: AccentMap = {
  student: "#3b82f6",
  business: "#6366f1",
  nexusos: "#8b5cf6"
};

export const ACCENTS_STORAGE_KEY = "nexus.accents";

export const parseAccentMap = (value: unknown): AccentMap | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const result: Partial<AccentMap> = {};
  for (const key of Object.keys(DEFAULT_ACCENTS) as ModeKey[]) {
    const raw = (value as Record<string, unknown>)[key];
    if (typeof raw === "string") {
      result[key] = raw;
    }
  }
  if (Object.keys(result).length === Object.keys(DEFAULT_ACCENTS).length) {
    return result as AccentMap;
  }
  return null;
};

export const getInitialAccentMap = (): AccentMap => {
  if (typeof window === "undefined") {
    return DEFAULT_ACCENTS;
  }
  const raw = window.localStorage.getItem(ACCENTS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_ACCENTS;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parseAccentMap(parsed) ?? DEFAULT_ACCENTS;
  } catch (error) {
    console.warn("Failed to parse stored accent map", error);
    return DEFAULT_ACCENTS;
  }
};
