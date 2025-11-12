export type Theme = "light" | "dark";

type StoredTheme = Theme;

export function setTheme(next: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(next);
  if (typeof window !== "undefined") {
    window.setTimeout(() => root.classList.remove("theme-transition"), 250);
  }
}

export function applyTheme(next: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", next === "dark");
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("theme", next);
  } catch {
    /* ignore storage errors */
  }
}

export function initTheme() {
  if (typeof window === "undefined") {
    applyTheme("light");
    return;
  }
  try {
    const saved = window.localStorage.getItem("theme") as StoredTheme | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved ?? (systemDark ? "dark" : "light"));
  } catch {
    applyTheme("light");
  }
}
