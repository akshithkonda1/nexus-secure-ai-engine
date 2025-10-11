import { useEffect, useState } from 'react';
export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => document.documentElement.classList.contains('dark'));
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); (document as any).documentElement?.style?.setProperty('color-scheme', isDark ? 'dark' : 'light'); }, [isDark]);
  return { isDark, setIsDark };
}
