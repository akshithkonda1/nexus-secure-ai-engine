import { BRAND } from "@/config/branding";

const LOGO_SRC = "/assets/nexus-logo.png";

export function BrandMark({ className = "h-6 w-auto" }: { className?: string }) {
  const src = BRAND.dark ?? LOGO_SRC;

  return (
    <img
      src={src}
      alt="Nexus"
      className={className}
      width={132}
      height={32}
      loading="lazy"
      decoding="async"
    />
  );
}
