import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { useChatStore } from "@/hooks/useChatStore";
import { Attachment } from "@/hooks/useChatStore";
import { readJSON } from "@/lib/utils";

const SYSTEM_SUGGESTIONS = [
  "Summarise this conversation into crisp next steps.",
  "Draft a Script.io-style workflow using today's uploads.",
  "Generate an anonymised executive recap with highlights.",
  "Map dependencies and risks as a JSON payload."
];

function pickRandom<T>(source: T[], count: number) {
  const clone = [...source];
  const items: T[] = [];
  while (clone.length && items.length < count) {
    const index = Math.floor(Math.random() * clone.length);
    items.push(clone.splice(index, 1)[0]);
  }
  return items;
}

export default function ChatPage() {
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sending = useChatStore((state) => state.sending);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const suggestions = useMemo(() => {
    if (typeof window === "undefined") {
      return pickRandom(SYSTEM_SUGGESTIONS, 2);
    }
    const stored = readJSON<{ title?: string; content?: string }[]>(
      window.localStorage.getItem("nexus.templates") ?? "",
      []
    )
      .map((template) => template.content || template.title)
      .filter(Boolean) as string[];

    const fromTemplates = pickRandom(stored, 2);
    const fromSystem = pickRandom(SYSTEM_SUGGESTIONS, 2);
    return [...fromTemplates, ...fromSystem];
  }, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand)_18%,transparent)] via-transparent to-transparent" />
      <div ref={viewportRef} className="relative z-10 flex-1 overflow-y-auto px-4 pb-32 pt-8 sm:px-12">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ChatMessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 mx-auto flex w-full max-w-3xl justify-center px-4 pb-8 sm:px-12">
        <ChatInput
          disabled={sending}
          suggestions={suggestions}
          onSend={({ text, files }) => {
            const attachments: Attachment[] = files.map((file) => ({
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file)
            }));
            sendMessage(text, attachments);
          }}
        />
      </div>
    </div>
  );
}
