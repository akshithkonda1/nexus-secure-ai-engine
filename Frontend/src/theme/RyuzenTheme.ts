import type { ResolvedTheme, ThemeMode } from "./ThemeProvider";

export type RyuzenPalette = {
  accents: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  surfaces: {
    0: string;
    1: string;
    2: string;
    glass: string;
    ps5: string;
  };
  panels: {
    primary: string;
    elevated: string;
    deep: string;
  };
  borders: {
    soft: string;
    strong: string;
  };
  shadows: {
    1: string;
    2: string;
    3: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  toron: {
    good: string;
    warn: string;
    critical: string;
  };
  glow: {
    cyan: string;
    purple: string;
    blue: string;
  };
  gradients: {
    hybridPulse: string;
    sheen: string;
    panelDepth: string;
  };
};

const corePulse = {
  c1: "#29f5ff",
  c2: "#9b4dff",
  c3: "#2b6bff",
};

const basePalette: RyuzenPalette = {
  accents: {
    primary: "var(--accent-primary)",
    secondary: "var(--accent-secondary)",
    tertiary: "var(--accent-tertiary)",
  },
  surfaces: {
    0: "var(--surface-0)",
    1: "var(--surface-1)",
    2: "var(--surface-2)",
    glass: "var(--surface-glass)",
    ps5: "var(--surface-ps5)",
  },
  panels: {
    primary: "var(--panel-primary)",
    elevated: "var(--panel-elevated)",
    deep: "var(--panel-deep)",
  },
  borders: {
    soft: "var(--border-soft)",
    strong: "var(--border-strong)",
  },
  shadows: {
    1: "var(--shadow-1)",
    2: "var(--shadow-2)",
    3: "var(--shadow-3)",
  },
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    disabled: "var(--text-disabled)",
  },
  toron: {
    good: "var(--toron-good)",
    warn: "var(--toron-warn)",
    critical: "var(--toron-critical)",
  },
  glow: {
    cyan: "var(--glow-cyan)",
    purple: "var(--glow-purple)",
    blue: "var(--glow-blue)",
  },
  gradients: {
    hybridPulse: "var(--gradient-hybrid-pulse)",
    sheen: "var(--gradient-sheen)",
    panelDepth: "var(--gradient-panel-depth)",
  },
};

export const RyuzenTheme = {
  tokens: basePalette,
  corePulse,
};

export const themeModes: ThemeMode[] = ["light", "dark", "system"];

export const paletteHelpers = {
  accent: (tone: keyof RyuzenPalette["accents"]) => basePalette.accents[tone],
  text: (tone: keyof RyuzenPalette["text"]) => basePalette.text[tone],
  glow: (tone: keyof RyuzenPalette["glow"]) => basePalette.glow[tone],
};

export function getCorePulseColor(phase: "c1" | "c2" | "c3" | 1 | 2 | 3): string {
  const key = typeof phase === "number" ? (`c${phase}` as const) : phase;
  return corePulse[key] ?? corePulse.c1;
}

export function getSurface(level: 0 | 1 | 2 | "glass" | "ps5" = 0): string {
  switch (level) {
    case 1:
      return basePalette.surfaces[1];
    case 2:
      return basePalette.surfaces[2];
    case "glass":
      return basePalette.surfaces.glass;
    case "ps5":
      return basePalette.surfaces.ps5;
    case 0:
    default:
      return basePalette.surfaces[0];
  }
}

export type { ThemeMode, ResolvedTheme };
