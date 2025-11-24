import { useMemo } from "react";

import { useThemeContext, type ResolvedTheme, type ThemeMode } from "./ThemeProvider";

export type { ThemeMode, ResolvedTheme } from "./ThemeProvider";

export function useTheme() {
  const ctx = useThemeContext();

  const value = useMemo(
    () => ({
      theme: ctx.theme,
      setTheme: ctx.setTheme,
      resolvedTheme: ctx.resolvedTheme,
    }),
    [ctx.theme, ctx.setTheme, ctx.resolvedTheme],
  );

  return value;
}

export default useTheme;
