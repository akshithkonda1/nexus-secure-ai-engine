import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { BRAND } from "@/config/branding";
export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? BRAND.dark : BRAND.light;
  return <img src={src} alt="Nexus" className={className} width={96} height={24} />;
}
