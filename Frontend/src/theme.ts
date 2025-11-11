export type Theme = 'light' | 'dark';

export function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', next === 'dark');
  localStorage.setItem('theme', next);
}

export function initTheme() {
  try {
    const saved = localStorage.getItem('theme') as Theme | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ?? (systemDark ? 'dark' : 'light'));
  } catch {
    applyTheme('light');
  }
}

export function withTransition<T extends () => void>(fn: T) {
  const root = document.documentElement;
  root.classList.add('theme-transition');
  fn();
  window.setTimeout(() => root.classList.remove('theme-transition'), 250);
}
