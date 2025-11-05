// src/shared/ui/theme/domTheme.ts
export type ThemeChoice = "light" | "dark" | "system";

function systemPrefersDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function resolve(choice: ThemeChoice): "light" | "dark" {
  return choice === "system" ? (systemPrefersDark() ? "dark" : "light") : choice;
}

export function applyTheme(choice: ThemeChoice) {
  const resolved = resolve(choice);
  const html = document.documentElement;

  html.classList.toggle("dark", resolved === "dark");
  html.dataset.theme = resolved;

  try { localStorage.setItem("theme", choice); } catch {}
  window.dispatchEvent(new CustomEvent("themechange", { detail: { choice, resolved } }));
}

// global helper (non-React callers can do window.__setTheme("dark"|"light"|"system"))
;(window as any).__setTheme = (t: ThemeChoice) => applyTheme(t);

// keep “system” live when OS theme flips
const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
mq?.addEventListener?.("change", () => {
  const saved = (localStorage.getItem("theme") as ThemeChoice) || "system";
  if (saved === "system") applyTheme("system");
});
