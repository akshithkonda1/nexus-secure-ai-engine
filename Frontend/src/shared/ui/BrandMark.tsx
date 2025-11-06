import { BRAND } from "@/config/branding";
import { useTheme } from "../../theme/useTheme";

export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const { effective } = useTheme();
  const src = effective === "dark" ? BRAND.dark : BRAND.light;
  return <img src={src} alt="Nexus" className={className} width={96} height={24} />;
}
