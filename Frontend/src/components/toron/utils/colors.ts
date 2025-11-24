type SemanticState = "analysis" | "creativity" | "agreement" | "disagreement" | "instability";

type ThemeMode = "light" | "dark";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const SEMANTIC_COLORS: Record<SemanticState, { light: string; dark: string }> = {
  analysis: { light: "#06b6d4", dark: "#22d3ee" }, // cyan
  creativity: { light: "#7c3aed", dark: "#a855f7" }, // violet
  agreement: { light: "#10b981", dark: "#34d399" }, // emerald
  disagreement: { light: "#f59e0b", dark: "#fbbf24" }, // amber
  instability: { light: "#ef4444", dark: "#f87171" }, // red
};

export function alpha(color: string, opacity: number): string {
  const clamped = clamp(opacity, 0, 1);
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const bigint = parseInt(hex.length === 3 ? hex.repeat(2) : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }
  if (color.startsWith("rgb")) {
    return color.replace(")", `, ${clamped})`).replace("rgb(", "rgba(");
  }
  return color;
}

export function semanticColor(state: SemanticState, theme: ThemeMode): string {
  return SEMANTIC_COLORS[state][theme];
}

export function lerpColor(a: string, b: string, t: number): string {
  const ratio = clamp(t, 0, 1);
  const parse = (value: string) => {
    if (value.startsWith("#")) {
      const hex = value.replace("#", "");
      const bigint = parseInt(hex.length === 3 ? hex.repeat(2) : hex, 16);
      return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
      ];
    }
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return [0, 0, 0];
    return match[1].split(",").slice(0, 3).map((n) => parseFloat(n.trim()));
  };

  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);

  const r = Math.round(ar + (br - ar) * ratio);
  const g = Math.round(ag + (bg - ag) * ratio);
  const b = Math.round(ab + (bb - ab) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

