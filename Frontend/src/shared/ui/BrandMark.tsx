import { useEffect, useState } from "react";
import { BRAND } from "@/config/branding";
import { cn } from "@/shared/lib/cn";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

interface BrandMarkProps {
  className?: string;
  title?: string;
}

export function BrandMark({ className, title = "Nexus" }: BrandMarkProps) {
  const { theme } = useTheme();
  const [logoSrc, setLogoSrc] = useState<string>(BRAND.dark);

  useEffect(() => {
    setLogoSrc(BRAND[theme] ?? BRAND.dark);
  }, [theme]);

  return (
    <img
      src={logoSrc}
      alt={title}
      className={cn("brand-mark", className)}
      width={96}
      height={24}
      data-theme-logo={theme}
    />
  );
}
