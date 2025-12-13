import { useEffect, useMemo, useRef } from "react";

import type { ToronMessage } from "@/state/toron/toronSessionTypes";

import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ToronMessage[];
  onEditMessage: (message: ToronMessage) => void;
  onSaveToProject?: (content: string) => void;
}

export function MessageList({ messages, onEditMessage, onSaveToProject }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const ordered = useMemo(
    () => [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages],
  );

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [ordered]);

  if (!ordered.length) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center px-4 text-center text-[var(--text-secondary)]">
        <div className="max-w-xl rounded-3xl border border-white/10 bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 backdrop-blur-xl">
          <p className="text-2xl font-semibold text-[var(--text-primary)]">Welcome to Toron</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Ask Toron anything… Add files, toggle browsing, and stay in control with calm, focused responses.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={listRef}
      className="relative flex w-full max-w-5xl flex-1 flex-col gap-4 overflow-y-auto px-4 pb-32 pt-4 sm:px-6"
    >
      {ordered.map((message) => (
        <MessageBubble key={message.id} message={message} onEdit={onEditMessage} onSaveToProject={onSaveToProject} />
      ))}
    </section>
  );
}

export default MessageList;
