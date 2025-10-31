import { useMemo } from "react";
import { BRANDING } from "@/config/branding";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

export function useBrand() {
  const { theme } = useTheme();

  return useMemo(() => {
    const key = theme ?? "light";
    const brand = BRANDING[key];
    return {
      logo: brand.logo,
      alt: brand.alt,
      theme: key
    };
  }, [theme]);
}
