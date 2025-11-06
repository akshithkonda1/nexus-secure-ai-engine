export type ThemeChoice = "light" | "dark" | "system";
export type AppliedTheme = "light" | "dark";

export function resolveApplied(choice: ThemeChoice): AppliedTheme {
  if (choice === "light" || choice === "dark") return choice;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(choice: ThemeChoice): AppliedTheme {
  const applied = resolveApplied(choice);
  const root = document.documentElement;

  root.classList.toggle("dark", applied === "dark");
  root.dataset.theme = applied;
  localStorage.setItem("theme", choice);

  // expose a global setter for non-React callers (optional)
  (window as any).__setTheme = (t: ThemeChoice) => applyTheme(t);

  return applied;
}
