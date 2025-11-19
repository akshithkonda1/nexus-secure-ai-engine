import { BRAND } from "@/config/branding";
import { useTheme } from "./theme/ThemeProvider";

export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? BRAND.dark : BRAND.light;
  return <img src={src} alt="Ryuzen" className={className} width={160} height={48} />;
}
