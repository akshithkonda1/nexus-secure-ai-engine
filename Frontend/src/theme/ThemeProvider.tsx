import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useMemo, type PropsWithChildren } from "react";

import "./RyuzenTokens.css";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </NextThemesProvider>
  );
}

export function useThemeContext() {
  const { theme, resolvedTheme, setTheme } = useNextTheme();

  const safeResolved = (resolvedTheme ?? "light") as ResolvedTheme;
  const safeTheme = (theme ?? "system") as ThemeMode;

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
