import { memo, useMemo } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeRender } from "@/shared/lib/safeRender";
import { safeString } from "@/shared/lib/toronSafe";

interface ToronHeaderProps {
  onOpenProjects?: () => void;
  onNewChat?: () => void;
  title?: string;
}

const fallbackButtonHandler = (cb?: () => void, telemetry?: ReturnType<typeof useToronTelemetry>) => {
  try {
    cb?.();
  } catch (error) {
    telemetry?.("interaction", { action: "header_button", error: (error as Error).message });
  }
};

const HeaderComponent = ({ onOpenProjects, onNewChat, title }: ToronHeaderProps) => {
  const telemetry = useToronTelemetry();
  const resolvedTitle = useMemo(() => safeString(title, "Toron"), [title]);

  return safeRender(
    () => (
      <header className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--panel-strong)]/70 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--accent)]/10" aria-hidden />
          <div className="flex flex-col">
            <span className="text-xs text-[var(--text-secondary)]">Neural Ops</span>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">{resolvedTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fallbackButtonHandler(onOpenProjects, telemetry)}
            className="rounded-md border border-[var(--border-soft)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--panel-soft)]"
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => fallbackButtonHandler(onNewChat, telemetry)}
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-textPrimary shadow-sm transition hover:opacity-90"
          >
            New Chat
          </button>
        </div>
      </header>
    ),
    <div className="border-b border-[var(--border-soft)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--text-secondary)]">
      Toron header unavailable, but core experience remains active.
    </div>,
  );
};

export const ToronHeader = memo(HeaderComponent);

export default ToronHeader;
