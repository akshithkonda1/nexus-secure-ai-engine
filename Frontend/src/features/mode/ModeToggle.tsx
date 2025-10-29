import { BookOpen, BriefcaseBusiness, Cpu } from "lucide-react";
import { useSessionStore } from "@/shared/state/session";
import { cn } from "@/shared/lib/cn";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

const modes = [
  {
    value: "student" as const,
    label: "Student",
    icon: BookOpen,
    description: "Guided explanations & accessible pacing",
  },
  {
    value: "business" as const,
    label: "Business",
    icon: BriefcaseBusiness,
    description: "Executive-ready briefs & assertive tone",
  },
  {
    value: "nexusos" as const,
    label: "NexusOS",
    icon: Cpu,
    description: "Ops console for orchestrating AI teams",
  },
];

export function ModeToggle() {
  const activeMode = useSessionStore((state) => state.mode);
  const setMode = useSessionStore((state) => state.setMode);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-subtle bg-surface/80 p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.value;
        return (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex h-9 min-w-[48px] items-center justify-center gap-2 rounded-full px-3 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-indigo-500",
                  isActive
                    ? "bg-accent-soft text-white shadow-inner"
                    : "text-muted hover:bg-slate-900/10",
                )}
                onClick={() => setMode(mode.value)}
                aria-pressed={isActive}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{mode.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex max-w-[220px] flex-col gap-1">
                <strong className="text-xs font-semibold text-white">{mode.label} mode</strong>
                <span className="text-[11px] text-white/70">{mode.description}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
