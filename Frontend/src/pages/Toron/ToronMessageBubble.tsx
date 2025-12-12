import { memo } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeFormatDistance, safeMessage } from "@/shared/lib/toronSafe";
import type { ToronMessage } from "@/state/toron/toronSessionTypes";

interface ToronMessageBubbleProps {
  message: ToronMessage;
  onSaveToProject?: (content: string) => void;
}

const Bubble = ({ message, onSaveToProject }: ToronMessageBubbleProps) => {
  const telemetry = useToronTelemetry();
  const safe = safeMessage(message);

  try {
    return (
      <div
        className={`flex flex-col gap-1.5 rounded-2xl border px-4 py-3 text-sm shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur ${
          safe.role === "user"
            ? "self-end border-[var(--border-soft)]/70 bg-[color-mix(in_srgb,var(--panel-soft)_92%,transparent)]"
            : "self-start border-[var(--border-strong)]/60 bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)]"
        }`}
        data-testid="toron-message-bubble"
      >
        <div className="text-[var(--text-primary)]">{safe.content || "(empty message)"}</div>
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] opacity-80">
          <span>
            {safe.model} · {safeFormatDistance(safe.timestamp)}
          </span>
          {onSaveToProject && (
            <button
              type="button"
              className="rounded px-2 py-1 text-[var(--text-secondary)] transition hover:bg-[var(--panel-elevated)]/70"
              onClick={() => onSaveToProject(safe.content)}
              aria-label="Save message to project"
            >
              📁
            </button>
          )}
        </div>
      </div>
    );
  } catch (error) {
    telemetry("render_error", { component: "ToronMessageBubble", error: (error as Error).message });
    return (
      <div className="self-start rounded border border-[var(--border-strong)] bg-[var(--panel-strong)] px-3 py-2 text-xs text-[var(--text-secondary)]">
        Message unavailable.
      </div>
    );
  }
};

export const ToronMessageBubble = memo(Bubble);

export default ToronMessageBubble;
