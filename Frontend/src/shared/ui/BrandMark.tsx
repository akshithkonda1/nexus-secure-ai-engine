import { BRAND } from "@/config/branding";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? BRAND.dark : BRAND.light;
  return <img src={src} alt="Nexus" className={className} width={96} height={24} />;
}
