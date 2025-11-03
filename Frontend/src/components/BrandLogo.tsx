import { memo } from "react";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { NEXUS_LOGO_DARK, NEXUS_LOGO_LIGHT } from "@/assets/logos";

type BrandLogoProps = {
  width?: number;
  alt?: string;
  className?: string;
};

function BrandLogoComponent({ width = 148, alt = "Nexus", className }: BrandLogoProps) {
  const { theme } = useTheme();
  const src = theme === "light" ? NEXUS_LOGO_LIGHT : NEXUS_LOGO_DARK;

  return (
    <img
      src={src}
      width={width}
      alt={alt}
      className={className}
      decoding="async"
      loading="eager"
      style={{ height: "auto", display: "block", imageRendering: "auto" }}
    />
  );
}

export const BrandLogo = memo(BrandLogoComponent);
