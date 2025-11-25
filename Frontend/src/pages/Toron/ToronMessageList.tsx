import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import { useToronStore } from "@/state/toron/toronStore";

import ToronMessageBubble from "./ToronMessageBubble";
import ToronWelcome from "./ToronWelcome";

export function ToronMessageList() {
  const { messages, initialWelcomeShown } = useToronStore();
  const endRef = useRef<HTMLDivElement | null>(null);

  const hasUserMessage = useMemo(
    () => messages.some((msg) => msg.sender === "user"),
    [messages],
  );

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length]);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[color-mix(in_srgb,var(--background),transparent_0%)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[color-mix(in_srgb,var(--background),transparent_0%)] to-transparent" />

      <div className="relative h-full overflow-y-auto px-4 pb-28 pt-6" style={{ scrollBehavior: "smooth" }}>
        {!initialWelcomeShown && !hasUserMessage && <ToronWelcome />}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
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
