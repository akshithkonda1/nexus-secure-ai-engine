import RyuzenLogo from "@/assets/logo/ryuzen-logo.png";

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
