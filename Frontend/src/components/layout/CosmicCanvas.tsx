import { memo, useMemo } from "react";

import { useTheme } from "@/theme/useTheme";

function AuroraLayer() {
  const { resolvedTheme } = useTheme();
  const opacity = resolvedTheme === "dark" ? "opacity-100" : "opacity-60";
  const blur = resolvedTheme === "dark" ? "blur-3xl" : "blur-[42px]";

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${opacity}`}
      aria-hidden
    >
      <div
        className={`absolute -left-24 top-10 h-96 w-[32rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,93,255,0.24),transparent_65%)] ${blur}`}
      />
      <div
        className={`absolute right-[-12%] top-24 h-[26rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(52,224,161,0.18),transparent_60%)] ${blur}`}
      />
      <div
        className={`absolute left-1/3 bottom-0 h-[28rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.20),transparent_70%)] ${blur}`}
      />
    </div>
  );
}

function Starfield() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[var(--noise-opacity)]"
      aria-hidden
    />
  );
}

function GradientGrid() {
  const { resolvedTheme } = useTheme();
  const mask = useMemo(
    () =>
      resolvedTheme === "dark"
        ? "bg-[radial-gradient(120%_90%_at_10%_-10%,rgba(12,18,46,0.85),transparent),radial-gradient(140%_100%_at_90%_0%,rgba(8,34,52,0.9),transparent)]"
        : "bg-[radial-gradient(120%_90%_at_10%_-10%,rgba(238,244,255,0.85),transparent),radial-gradient(140%_100%_at_90%_0%,rgba(236,248,255,0.9),transparent)]",
    [resolvedTheme],
  );

  return <div className={`pointer-events-none absolute inset-0 ${mask}`} aria-hidden />;
}

export const CosmicCanvas = memo(function CosmicCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <GradientGrid />
      <AuroraLayer />
      <Starfield />
    </div>
  );
});

export default CosmicCanvas;
