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
        className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm shadow-sm ${
          safe.role === "user"
            ? "self-end border-[var(--border-soft)] bg-[var(--panel-soft)]"
            : "self-start border-[var(--border-strong)] bg-[var(--panel-strong)]"
        }`}
        data-testid="toron-message-bubble"
      >
        <div className="text-[var(--text-primary)]">{safe.content || "(empty message)"}</div>
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            {safe.model} · {safeFormatDistance(safe.timestamp)}
          </span>
          {onSaveToProject && (
            <button
              type="button"
              className="rounded px-2 py-1 text-[var(--text-secondary)] transition hover:bg-[var(--panel-elevated)]"
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
