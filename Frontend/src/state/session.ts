export function getSessionId(): string {
  const key = "nexus_session_id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export function setApiKey(key: string) {
  localStorage.setItem("nexus_api_key", key.trim());
}

export function getApiKey(): string {
  return localStorage.getItem("nexus_api_key") || "";
}

export function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

export function initTheme() {
  const stored = (localStorage.getItem("theme") as "light" | "dark") || "dark";
  setTheme(stored);
}
