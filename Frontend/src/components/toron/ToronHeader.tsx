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
      <header className="flex w-full items-center justify-between rounded-2xl bg-[color-mix(in_srgb,var(--panel-strong)_62%,transparent)]/70 px-3 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[var(--accent)]/10 opacity-80" aria-hidden />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-[var(--text-secondary)] opacity-70">Toron</span>
            <h1 className="text-base font-medium text-[var(--text-primary)]">{resolvedTitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fallbackButtonHandler(onOpenProjects, telemetry)}
            className="rounded-lg border border-[var(--border-soft)]/60 bg-[color-mix(in_srgb,var(--panel-elevated)_55%,transparent)] px-3 py-2 text-sm text-[var(--text-primary)] opacity-90 transition hover:bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)] hover:opacity-100"
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => fallbackButtonHandler(onNewChat, telemetry)}
            className="rounded-lg bg-[color-mix(in_srgb,var(--accent)_78%,transparent)] px-3 py-2 text-sm font-semibold text-textPrimary shadow-sm shadow-[0_10px_32px_rgba(0,0,0,0.18)] transition hover:opacity-95"
          >
            New Chat
          </button>
        </div>
      </header>
    ),
    <div className="w-full rounded-2xl bg-[color-mix(in_srgb,var(--panel-strong)_62%,transparent)]/70 px-3 py-2 text-sm text-[var(--text-secondary)]">
      Toron header unavailable, but core experience remains active.
    </div>,
  );
};

export const ToronHeader = memo(HeaderComponent);

export default ToronHeader;
