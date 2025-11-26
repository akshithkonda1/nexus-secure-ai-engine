import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import { useToronStore } from "@/state/toron/toronStore";

import ToronMessageBubble from "./ToronMessageBubble";
import ToronWelcome from "./ToronWelcome";
import type { ToronMessage } from "./toronTypes";

type NormalizedMessage = ToronMessage & { id: string; sender: string; text: string };

const normalizeMessage = (message: ToronMessage): NormalizedMessage | null => {
  if (!message) return null;

  if (typeof message.text !== "string") {
    console.warn("ToronMessageList skipped message with invalid text:", message);
    return null;
  }

  if (!message.sender || typeof message.sender !== "string") {
    console.warn("ToronMessageList skipped message with invalid sender:", message);
    return null;
  }

  const id = message.id ?? crypto.randomUUID();

  return { ...message, id, sender: message.sender, text: message.text };
};

export function ToronMessageList() {
  const { messages, initialWelcomeShown } = useToronStore();
  const endRef = useRef<HTMLDivElement | null>(null);

  const safeMessages = useMemo(() => {
    return (messages ?? [])
      .map(normalizeMessage)
      .filter((message): message is NormalizedMessage => message !== null);
  }, [messages]);

  const hasUserMessage = useMemo(
    () => safeMessages.some((msg) => msg.sender === "user"),
    [safeMessages],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 20);

    return () => clearTimeout(id);
  }, [safeMessages]);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[color-mix(in_srgb,var(--background),transparent_0%)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[color-mix(in_srgb,var(--background),transparent_0%)] to-transparent" />

      <div className="relative h-full overflow-y-auto px-4 pb-28 pt-6" style={{ scrollBehavior: "smooth" }}>
        {!initialWelcomeShown && !hasUserMessage && <ToronWelcome />}

        <AnimatePresence initial={false}>
          {safeMessages.map((message) => (
            <motion.div key={message.id} layout className="mb-3 last:mb-6">
              <ToronMessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}

export default ToronMessageList;
