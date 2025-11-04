import { BRAND } from "@/config/branding";
import { useTheme } from "@/stores/themeStore";

export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const resolvedTheme = useTheme((state) => state.resolvedTheme);
  const src = resolvedTheme === "dark" ? BRAND.dark : BRAND.light;
  return <img src={src} alt="Nexus" className={className} width={96} height={24} />;
}
