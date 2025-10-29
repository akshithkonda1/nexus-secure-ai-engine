import { BookOpen, Briefcase, Cpu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useThemeContext } from "@/shared/ui/theme/ThemeProvider";

const modes = [
  {
    value: "student" as const,
    label: "Student",
    description: "Patient explanations with accessible metaphors.",
    icon: BookOpen,
  },
  {
    value: "business" as const,
    label: "Business",
    description: "Succinct, impact-oriented insights for teams.",
    icon: Briefcase,
  },
  {
    value: "nexusos" as const,
    label: "Nexus OS",
    description: "Dense, analytical debate with citations.",
    icon: Cpu,
  },
];

export function ModeToggle(): JSX.Element {
  const { mode, setMode } = useThemeContext();

  const handleSelect = (value: (typeof modes)[number]["value"]) => {
    setMode(value);
    window.dispatchEvent(
      new CustomEvent("nexus-mode-change", {
        detail: { mode: value },
      })
    );
  };

  return (
    <TooltipProvider>
      <div className="flex rounded-xl border border-subtle bg-[var(--app-surface)] p-1">
        {modes.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === mode;
          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  className="flex h-9 flex-col items-center justify-center px-3 text-xs"
                  aria-pressed={isActive}
                  onClick={() => handleSelect(option.value)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="mt-0.5 text-[11px] font-semibold">{option.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[220px] text-xs font-medium">{option.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
