import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";

import { ThemeProvider, ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

test("theme toggle switches modes", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

  const toggle = screen.getByRole("button", { name: /switch to dark mode/i });
  expect(toggle).toHaveAttribute("data-theme-choice", "light");

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("data-theme-choice", "dark");
});
