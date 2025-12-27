import { MessageSquare, Layout, Compass, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn, text, bg, border } from "../../utils/theme";

export default function HomeRail() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Start with Toron",
      description: "Multi-model AI reasoning",
      icon: MessageSquare,
      gradient: "from-blue-500 to-blue-600",
      path: "/toron",
    },
    {
      title: "Open Workspace",
      description: "Productivity environment",
      icon: Layout,
      gradient: "from-purple-500 to-purple-600",
      path: "/workspace",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Compass className={cn("h-5 w-5", text.accent)} />
        <h2 className={cn("text-sm font-semibold", text.primary)}>
          Quick Navigation
        </h2>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={cn(
              "group w-full rounded-xl border p-4 text-left transition-all",
              border.subtle,
              bg.surface,
              "hover:border-[var(--accent-primary)] hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                action.gradient
              )}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <ArrowRight className={cn(
                "ml-auto h-4 w-4 transition-transform",
                text.tertiary,
                "group-hover:translate-x-1 group-hover:text-[var(--accent-primary)]"
              )} />
            </div>

            <h3 className={cn("mb-1 text-sm font-semibold", text.primary)}>
              {action.title}
            </h3>

            <p className={cn("text-xs", text.tertiary)}>
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {/* Info Card */}
      <div className={cn(
        "mt-4 rounded-xl border p-4",
        "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50",
        "dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/20"
      )}>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className={cn(
            "h-4 w-4",
            "text-orange-600 dark:text-orange-400"
          )} />
          <span className={cn(
            "text-xs font-semibold",
            "text-orange-700 dark:text-orange-300"
          )}>
            Powered by ALOE
          </span>
        </div>

        <p className={cn(
          "text-xs leading-relaxed",
          "text-orange-600 dark:text-orange-400"
        )}>
          AI as a Life Orchestration Engine — built for epistemic honesty and user agency
        </p>
      </div>

      {/* Stats */}
      <div className={cn("mt-2 space-y-2 rounded-xl border p-4", border.subtle, bg.elevated)}>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs", text.tertiary)}>AI Models</span>
          <span className={cn("text-sm font-semibold", text.primary)}>11</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-xs", text.tertiary)}>Integrations</span>
          <span className={cn("text-sm font-semibold", text.primary)}>34</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-xs", text.tertiary)}>Response Time</span>
          <span className={cn("text-sm font-semibold", text.primary)}>1.8-4s</span>
        </div>
      </div>
    </div>
  );
}
