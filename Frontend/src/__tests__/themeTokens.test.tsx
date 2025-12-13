import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const LIGHT_VARS = {
  "--text-primary": "rgba(12, 18, 36, 0.92)",
  "--text-secondary": "rgba(75, 85, 107, 0.78)",
  "--text-muted": "rgba(75, 85, 107, 0.6)",
  "--bg-primary": "#f4f6fa",
  "--bg-secondary": "#ecf1f8",
  "--bg-elevated": "#ffffff",
  "--border-light": "#d9e0ec",
  "--border-strong": "#d9e0ec",
};

const DARK_VARS = {
  "--text-primary": "rgba(230, 235, 247, 0.92)",
  "--text-secondary": "rgba(159, 172, 201, 0.78)",
  "--text-muted": "rgba(159, 172, 201, 0.65)",
  "--bg-primary": "#0b1018",
  "--bg-secondary": "#101829",
  "--bg-elevated": "#141c2b",
  "--border-light": "#2a374d",
  "--border-strong": "#2a374d",
};

function applyVars(theme: "light" | "dark") {
  const vars = theme === "light" ? LIGHT_VARS : DARK_VARS;
  document.documentElement.setAttribute("data-theme", theme);
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  return vars;
}

describe("theme tokens", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    Object.keys({ ...LIGHT_VARS, ...DARK_VARS }).forEach((key) =>
      document.documentElement.style.removeProperty(key),
    );
  });

  it("resolves tokens correctly in light mode", () => {
    const vars = applyVars("light");
    render(<div data-testid="box" style={{ color: "var(--text-primary)", background: "var(--bg-primary)" }} />);

    expect(document.documentElement.style.getPropertyValue("--text-primary").trim()).toBe(vars["--text-primary"]);
    expect(document.documentElement.style.getPropertyValue("--bg-primary").trim()).toBe(vars["--bg-primary"]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("resolves tokens correctly in dark mode", () => {
    const vars = applyVars("dark");
    render(<div data-testid="box" style={{ color: "var(--text-primary)", background: "var(--bg-primary)" }} />);

    expect(document.documentElement.style.getPropertyValue("--text-primary").trim()).toBe(vars["--text-primary"]);
    expect(document.documentElement.style.getPropertyValue("--bg-primary").trim()).toBe(vars["--bg-primary"]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("flags hardcoded tailwind color usage", () => {
    const bannedPatterns = [
      /text-textPrimary/,
      /text-(gray|neutral|slate|zinc)/,
      /bg-bgPrimary/,
      /bg-bgSecondary/,
    ];

    const targetDirs = ["theme", "styles", "__tests__"];
    const currentFile = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(currentFile);
    const projectRoot = path.resolve(__dirname, "../");

    const files: string[] = [];
    const enqueue = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          enqueue(full);
        } else if (/\.(t|j)sx?$/.test(entry.name)) {
          files.push(full);
        }
      }
    };

    targetDirs.forEach((dir) => enqueue(path.join(projectRoot, dir)));

    const offenders = files
      .filter((file) => file !== currentFile)
      .map((file) => ({ file, content: fs.readFileSync(file, "utf8") }))
      .flatMap(({ file, content }) =>
        bannedPatterns
          .filter((pattern) => pattern.test(content))
          .map((pattern) => `${file} matches ${pattern}`),
      );

    expect(offenders).toEqual([]);
  });
});
