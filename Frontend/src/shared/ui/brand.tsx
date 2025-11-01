import { useId } from "react";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

const palette = {
  dark: {
    gradient: ["#7C5CFF", "#22D3EE"],
    iconStroke: "rgba(15, 23, 42, 0.3)",
    wordmark: "#F8FAFC",
    badgeBorder: "rgba(148, 163, 184, 0.25)",
    badgeBackground: "rgba(148, 163, 184, 0.1)",
    badgeText: "rgba(226, 232, 240, 0.9)",
  },
  light: {
    gradient: ["#4338CA", "#2563EB"],
    iconStroke: "rgba(15, 23, 42, 0.2)",
    wordmark: "#0F172A",
    badgeBorder: "rgba(15, 23, 42, 0.12)",
    badgeBackground: "rgba(59, 130, 246, 0.08)",
    badgeText: "#1D4ED8",
  },
} as const;

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function BrandMark({ className = "h-6" }: { className?: string }) {
  const { theme } = useTheme();
  const colors = palette[theme];
  const gradientId = `${useId()}-brand-gradient`;

  return (
    <span className={cx("inline-flex items-center gap-2", className)} aria-label="Nexus">
      <svg
        viewBox="0 0 48 48"
        className="h-full w-auto"
        role="img"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="8" y1="40" x2="42" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colors.gradient[0]} />
            <stop offset="100%" stopColor={colors.gradient[1]} />
          </linearGradient>
        </defs>
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill={`url(#${gradientId})`}
          stroke={colors.iconStroke}
          strokeWidth="1.5"
        />
        <path
          d="M17 15h5.6l8.4 14.5V15h4v20h-5.6L21 20.5V35h-4V15Z"
          fill="#FFFFFF"
          fillOpacity="0.94"
        />
      </svg>
      <span className="font-semibold leading-none tracking-tight" style={{ color: colors.wordmark }}>
        Nexus
      </span>
      <span
        className="rounded-full border px-2 py-[2px] text-[0.55rem] font-semibold uppercase tracking-[0.35em]"
        style={{
          color: colors.badgeText,
          borderColor: colors.badgeBorder,
          backgroundColor: colors.badgeBackground,
        }}
      >
        AI
      </span>
    </span>
  );
}
