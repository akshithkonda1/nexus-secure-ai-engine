import { memo, useMemo } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeArray, safeMessage } from "@/shared/lib/toronSafe";
import { useToronStore } from "@/state/toron/toronStore";

import { ToronMessageBubble } from "./ToronMessageBubble";
import { ToronWelcome } from "./ToronWelcome";

const List = () => {
  const telemetry = useToronTelemetry();
  const { sessions, activeSessionId, getActiveSession } = useToronStore();
  const session = useMemo(() => getActiveSession(), [getActiveSession, sessions, activeSessionId]);
  const messages = useMemo(() => safeArray(session?.messages, []).map(safeMessage), [session?.messages]);

  try {
    if (!session || messages.length === 0) {
      return <ToronWelcome />;
    }

    return (
      <section className="flex flex-1 flex-col gap-2 overflow-y-auto bg-[var(--panel-main)] p-4" data-testid="toron-message-list">
        {messages.map((message) => (
          <ToronMessageBubble key={message.id} message={message} />
        ))}
      </section>
    );
  } catch (error) {
    telemetry("render_error", { component: "ToronMessageList", error: (error as Error).message });
    return (
      <section className="flex flex-1 flex-col items-center justify-center bg-[var(--panel-main)] p-4 text-sm text-[var(--text-secondary)]">
        Messages temporarily unavailable.
      </section>
    );
  }
};

export const ToronMessageList = memo(List);

export default ToronMessageList;
