import { PropsWithChildren, useEffect, useMemo } from "react";

import { RyuzenThemeProvider, useRyuzenTheme } from "./RyuzenThemeProvider";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

function ThemeAttributeSync({ children }: PropsWithChildren) {
  const { resolvedTheme } = useRyuzenTheme();

  useEffect(() => {
    const nextTheme = (resolvedTheme ?? "dark") as ResolvedTheme;
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <RyuzenThemeProvider>
      <ThemeAttributeSync>{children}</ThemeAttributeSync>
    </RyuzenThemeProvider>
  );
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
