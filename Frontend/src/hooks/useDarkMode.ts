import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nexus.theme';

function resolveInitialTheme(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    // ignore storage errors (e.g., private mode)
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return true;
  }

  return document.documentElement.classList.contains('dark');
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => resolveInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    (document as any).documentElement?.style?.setProperty('color-scheme', isDark ? 'dark' : 'light');

    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  return { isDark, setIsDark };
}
