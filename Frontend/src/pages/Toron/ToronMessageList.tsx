import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import { ToronSession, ToronMessage } from "@/state/toron/toronSessionTypes";

import ToronMessageBubble from "./ToronMessageBubble";
import ToronWelcome from "./ToronWelcome";
type StableMessage = ToronMessage & { id: string };

type ToronMessageListProps = {
  session: ToronSession | null;
};

export function ToronMessageList({ session }: ToronMessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const safeMessages = useMemo<StableMessage[]>(() => {
    const messages = session?.messages ?? [];
    return messages
      .filter(
        (message): message is ToronMessage =>
          typeof message?.text === "string" && Boolean(message?.sender),
      )
      .map((message) => ({ ...message, id: message.id ?? crypto.randomUUID() }));
  }, [session?.messages]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, [safeMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages.length]);

  const showWelcome = safeMessages.length === 0;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[color-mix(in_srgb,var(--background),transparent_0%)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[color-mix(in_srgb,var(--background),transparent_0%)] to-transparent" />

      <div
        ref={containerRef}
        className="relative h-full overflow-y-auto px-4 pb-28 pt-6"
        style={{ scrollBehavior: "smooth" }}
      >
        {showWelcome ? (
          <ToronWelcome />
        ) : (
          <AnimatePresence initial={false}>
            {safeMessages.map((message, index) => (
              <motion.div key={message.id} layout className="mb-3 last:mb-6">
                <ToronMessageBubble
                  message={message}
                  index={index}
                  isStreaming={false}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default ToronMessageList;
