import { useEffect, type ReactNode } from "react";
import { useTheme } from "@/stores/themeStore";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const init = useTheme((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
