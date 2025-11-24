import { ThemeProvider as RyuzenThemeProvider, useTheme as useRyuzenTheme, type ThemeMode } from "@/theme/ThemeProvider";

export const ThemeProvider = RyuzenThemeProvider;
export const useTheme = useRyuzenTheme;
export type { ThemeMode };
