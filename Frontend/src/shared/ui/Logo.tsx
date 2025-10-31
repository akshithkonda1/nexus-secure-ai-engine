import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { cn } from "@/shared/lib/cn";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

const LIGHT_LOGO = "/assets/nexus-logo.png";
const DARK_LOGO = "/assets/nexus-logo-inverted.png";

export type LogoProps = {
  height?: number;
  className?: string;
  "aria-label"?: string;
};

const FALLBACK_VIEWBOX_WIDTH = 160;
const FALLBACK_VIEWBOX_HEIGHT = 32;

export default function Logo({ height = 24, className, "aria-label": ariaLabel }: LogoProps) {
  const { theme } = useTheme();
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [theme]);

  const src = theme === "dark" ? DARK_LOGO : LIGHT_LOGO;
  const dimensionStyle: CSSProperties = {
    height,
    width: "auto"
  };

  const isDark = theme === "dark";
  const textColor = isDark ? "#F8FAFC" : "#111827";
  const accentColor = "#8B5CF6";
  const accentHighlight = isDark ? "#C4B5FD" : "#4C1D95";
  const label = ariaLabel ?? "Nexus";

  if (useFallback) {
    return (
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${FALLBACK_VIEWBOX_WIDTH} ${FALLBACK_VIEWBOX_HEIGHT}`}
        style={dimensionStyle}
        className={cn(height === 24 ? "logo-24" : undefined, className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{label}</title>
        <g fill="none" fillRule="evenodd">
          <rect x="0" y="0" width="32" height="32" rx="8" fill={accentColor} />
          <path
            d="M10 9.5L17.5 16l-7.5 6.5"
            stroke={accentHighlight}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="44"
            y="21"
            fontFamily="'Inter', 'Segoe UI', sans-serif"
            fontWeight="600"
            fontSize="18"
            fill={textColor}
          >
            Nexus
          </text>
        </g>
      </svg>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      onError={() => setUseFallback(true)}
      style={dimensionStyle}
      className={cn(height === 24 ? "logo-24" : undefined, className)}
      loading="lazy"
    />
  );
}
