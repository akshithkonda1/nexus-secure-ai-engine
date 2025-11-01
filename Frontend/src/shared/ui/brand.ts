import { createElement } from "react";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

const BRAND = {
  dark:  "/brand/nexus-logo.png",
  light: "/brand/nexus-logo-inverted.png",
} as const;

export function BrandMark({ className = "h-5 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? BRAND.dark : BRAND.light;
  return createElement("img", { src, alt: "Nexus", className, width: 88, height: 20 });
}
