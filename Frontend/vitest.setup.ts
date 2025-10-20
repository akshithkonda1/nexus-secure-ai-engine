import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Ensure DOM-like globals are available for tests that depend on browser APIs.
if (typeof window !== "undefined") {
  const { localStorage, sessionStorage } = window;

  Object.defineProperty(globalThis, "localStorage", {
    value: localStorage,
    configurable: true
  });

  Object.defineProperty(globalThis, "sessionStorage", {
    value: sessionStorage,
    configurable: true
  });
}
