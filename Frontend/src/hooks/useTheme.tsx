import { ThemeProvider, useThemeContext, type ThemeMode } from "@/theme/ThemeProvider";

export function useTheme() {
  return useThemeContext();
}

export { ThemeProvider };
export type { ThemeMode };
