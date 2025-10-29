import type { NexusMode } from "@/shared/state/session";

export interface ModeTheme {
  name: NexusMode;
  description: string;
  accent: string;
  gradient: string;
  density: "airy" | "medium" | "dense";
  surfaceTone: string;
}

export const modeThemes: Record<NexusMode, ModeTheme> = {
  student: {
    name: "student",
    description: "Curious, encouraging, and simplified for rapid learning.",
    accent: "#2563eb",
    gradient: "linear-gradient(135deg, #2563eb, #22d3ee)",
    density: "airy",
    surfaceTone: "Soft surfaces with calming blues and cyan accents.",
  },
  business: {
    name: "business",
    description: "Executive-ready, succinct, and focused on measurable impact.",
    accent: "#4338ca",
    gradient: "linear-gradient(135deg, #4338ca, #0f172a)",
    density: "medium",
    surfaceTone: "Confident surfaces with measured spacing and contrast.",
  },
  nexusos: {
    name: "nexusos",
    description: "Dense, utilitarian, and tuned for power operators.",
    accent: "#7c3aed",
    gradient: "linear-gradient(135deg, #8b5cf6, #3730a3)",
    density: "dense",
    surfaceTone: "High contrast utilitarian surfaces for rapid cognition.",
  },
};
