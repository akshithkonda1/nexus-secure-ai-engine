import { useCallback, useState } from "react";

import { ChatMessage } from "@/features/chat/context/ChatContext";
import { ToronDirection, sendToronFeedback } from "@/api/zoraClient";

export function useToronFeedback(sessionId?: string, modelHint?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sendFeedback = useCallback(
    async (message: ChatMessage, direction: ToronDirection) => {
      if (!sessionId) return;
      setIsSubmitting(true);
      setLastError(null);
      try {
        await sendToronFeedback({
          messageId: message.id,
          sessionId,
          direction,
          model: modelHint,
          role: message.role,
          createdAt: message.createdAt,
        });
      } catch (error) {
        setLastError(
          error instanceof Error ? error.message : "Unable to send feedback",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, modelHint],
  );

  return { sendFeedback, isSubmitting, lastError };
}
