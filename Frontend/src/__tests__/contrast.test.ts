import { describe, expect, it } from "vitest";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function luminance([r, g, b]: number[]) {
  const channel = (c: number) => {
    const value = c / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [rL, gL, bL] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function contrastRatio(foreground: string, background: string) {
  const l1 = luminance(hexToRgb(foreground)) + 0.05;
  const l2 = luminance(hexToRgb(background)) + 0.05;
  return Math.max(l1, l2) / Math.min(l1, l2);
}

describe("theme contrast", () => {
  const lightTheme = {
    text: "#0a0a0a",
    muted: "#5a5a5a",
    background: "#ffffff",
    secondary: "#f7f7f7",
  };

  const darkTheme = {
    text: "#ffffff",
    muted: "#a3a3a3",
    background: "#0a0a0f",
    secondary: "#11121a",
  };

  const scenarios = [
    { name: "light primary", fg: lightTheme.text, bg: lightTheme.background },
    { name: "light muted", fg: lightTheme.muted, bg: lightTheme.secondary },
    { name: "dark primary", fg: darkTheme.text, bg: darkTheme.background },
    { name: "dark muted", fg: darkTheme.muted, bg: darkTheme.secondary },
  ];

  it("keeps contrast ratios above AA thresholds", () => {
    const failing = scenarios.filter(({ fg, bg }) => contrastRatio(fg, bg) < 4.5);
    expect(failing).toEqual([]);
  });
});
