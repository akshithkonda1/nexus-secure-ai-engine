import { PropsWithChildren, useMemo } from "react";

import { RyuzenThemeProvider, useRyuzenTheme } from "./RyuzenThemeProvider";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function ThemeProvider({ children }: PropsWithChildren) {
  return <RyuzenThemeProvider>{children}</RyuzenThemeProvider>;
}

export function useThemeContext() {
  const { theme, setTheme, resolvedTheme } = useRyuzenTheme();

  const safeResolved = (resolvedTheme ?? "dark") as ResolvedTheme;
  const safeTheme = (theme ?? "dark") as ThemeMode;

  const toggleTheme = () => setTheme(safeResolved === "dark" ? "light" : "dark");

  return useMemo(
    () => ({
      theme: safeTheme,
      resolvedTheme: safeResolved,
      setTheme,
      toggleTheme,
    }),
    [safeResolved, safeTheme, setTheme],
  );
}

export { useThemeContext as useTheme };
