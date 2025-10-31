import { motion } from "framer-motion";
import { useCallback } from "react";
import { cn } from "@/shared/lib/cn";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { logEvent } from "@/shared/lib/audit";

const MODES = [
  { value: "student", label: "Student" },
  { value: "business", label: "Business" },
  { value: "nexusos", label: "NexusOS" }
] as const;

type ModeValue = (typeof MODES)[number]["value"];

export function ModeSegmented() {
  const { mode, setMode } = useTheme();

  const handleChange = useCallback(
    (next: ModeValue) => {
      if (next === mode) {
        return;
      }
      setMode(next);
      logEvent("mode.change", { mode: next });
    },
    [mode, setMode]
  );

  return (
    <div
      role="group"
      aria-label="Select workspace mode"
      className="relative flex items-center gap-1 rounded-full border border-app bg-[color:rgba(148,163,184,0.14)] p-1 shadow-inner dark:bg-[color:rgba(255,255,255,0.08)]"
    >
      {MODES.map((option) => {
        const isActive = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleChange(option.value)}
            className={cn(
              "relative flex-1 overflow-hidden rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]",
              isActive ? "text-white" : "text-muted hover:text-app"
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="mode-thumb"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
