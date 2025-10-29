export type NexusMode = "student" | "business" | "nexusos";

export interface ModeTokens {
  name: string;
  accent: string;
  accentSoft: string;
  surface: string;
  density: "relaxed" | "compact" | "compressed";
  description: string;
}

export const MODE_TOKENS: Record<NexusMode, ModeTokens> = {
  student: {
    name: "Student",
    accent: "#2563eb",
    accentSoft: "#22d3ee",
    surface: "Softer surfaces with layered glow",
    density: "relaxed",
    description: "Curated for exploratory learning with calm pacing.",
  },
  business: {
    name: "Business",
    accent: "#3730a3",
    accentSoft: "#1e293b",
    surface: "Flat, high-contrast surfaces",
    density: "compact",
    description: "Structured for busy operators with higher information density.",
  },
  nexusos: {
    name: "NexusOS",
    accent: "linear-gradient(135deg,#6d28d9,#4338ca)",
    accentSoft: "#4c1d95",
    surface: "Utilitarian glass panels",
    density: "compressed",
    description: "The command center for orchestrating verifiable AI workstreams.",
  },
};
