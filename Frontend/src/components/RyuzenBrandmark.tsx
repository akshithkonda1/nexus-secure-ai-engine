import { Link } from "react-router-dom";

import RyuzenLogo from "@/assets/ryuzen-dragon.svg";

type RyuzenBrandmarkProps = {
  size?: number;
  className?: string;
};

export function RyuzenBrandmark({
  size = 42,
  className = "",
}: RyuzenBrandmarkProps) {
  return (
    <img
      src={RyuzenLogo}
      alt="Ryuzen Logo"
      width={size}
      height={size}
      draggable={false}
      className={[
        "object-contain select-none pointer-events-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

type RyuzenLogoBadgeProps = {
  size?: number;
  className?: string;
};

export function RyuzenLogoBadge({ size = 48, className = "" }: RyuzenLogoBadgeProps) {
  const logoSize = Math.round(size * 0.87);

  return (
    <Link
      to="/"
      aria-label="Go to Home"
      className={`group relative inline-flex items-center justify-center rounded-full transition duration-100 ease-out hover:scale-[1.01] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)] ${className}`}
      style={{
        width: size,
        height: size,
        background: "color-mix(in srgb, var(--panel-strong) 88%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent)",
        cursor: "pointer",
      }}
    >
      <RyuzenBrandmark
        size={logoSize}
        className="pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
      />
    </Link>
  );
}
