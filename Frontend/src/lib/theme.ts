const STORAGE_KEY = 'nexus:theme';
export type Theme = 'light' | 'dark' | 'system';

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const shouldDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.classList.toggle('dark', shouldDark);
}

export function initTheme() {
  const saved = (localStorage.getItem(STORAGE_KEY) as Theme) || 'dark';
  applyTheme(saved);
}

export function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const next: Theme = isDark ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
}
