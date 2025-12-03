import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function ThemeToggleButton() {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} aria-label={`switch to ${resolvedTheme === "dark" ? "light" : "dark"}`}>
      Current: {resolvedTheme}
    </button>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: false,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia);
  });

  it("applies data-theme attribute on html", () => {
    render(
      <ThemeProvider>
        <div>child</div>
      </ThemeProvider>,
    );

    expect(document.documentElement.getAttribute("data-theme")).toBeTruthy();
  });

  it("reacts to theme changes immediately", () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button");
    const initialTheme = document.documentElement.getAttribute("data-theme");
    fireEvent.click(button);
    const updatedTheme = document.documentElement.getAttribute("data-theme");

    expect(initialTheme).not.toBe(updatedTheme);
    expect(updatedTheme === "dark" || updatedTheme === "light").toBe(true);
  });
});
