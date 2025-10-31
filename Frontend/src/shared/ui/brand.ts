import { useTheme } from "@/shared/ui/theme/ThemeProvider";

const LOGO_DARK = "/brand/nexus-logo.png";
const LOGO_LIGHT = "/brand/nexus-logo-inverted.png";

export function useBrandAssets() {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? LOGO_DARK : LOGO_LIGHT;
  const logoSrcSet =
    theme === "dark"
      ? "/brand/nexus-logo.png, /brand/nexus-logo@2x.png 2x"
      : "/brand/nexus-logo-inverted.png, /brand/nexus-logo-inverted@2x.png 2x";
  return { logoSrc, logoSrcSet };
}

export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const { logoSrc, logoSrcSet } = useBrandAssets();
  return (
    <img
      src={logoSrc}
      srcSet={logoSrcSet}
      alt="Nexus"
      className={className}
      width={96}
      height={24}
      style={{ imageRendering: "auto" }}
    />
  );
}
