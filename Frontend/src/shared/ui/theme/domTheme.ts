// src/shared/theme/domTheme.ts
export type ThemeChoice = "light" | "dark" | "system";

function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return choice;
}

export function applyTheme(choice: ThemeChoice) {
  const resolved = resolve(choice);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
  try { localStorage.setItem("theme", choice); } catch {}
  window.dispatchEvent(new CustomEvent("themechange", { detail: { choice, resolved } }));
}

// expose for any non-React callers
;(window as any).__setTheme = (t: ThemeChoice) => applyTheme(t);

// keep “system” live
const mq = window.matchMedia("(prefers-color-scheme: dark)");
mq.addEventListener?.("change", () => {
  const saved = (localStorage.getItem("theme") as ThemeChoice) || "system";
  if (saved === "system") applyTheme("system");
});
