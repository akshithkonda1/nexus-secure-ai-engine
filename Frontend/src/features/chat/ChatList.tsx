import { Fragment, useEffect, useRef } from "react";
import { Chat } from "@/services/storage/chats";

interface ChatListProps {
  chat?: Chat;
}

export function ChatList({ chat }: ChatListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  if (!chat || chat.messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted">
        <p className="text-lg font-medium text-app">Start a conversation</p>
        <p className="max-w-sm text-sm text-muted">
          Nexus.ai convenes multiple specialists to cross-check your question. Ask anything.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {chat.messages.map((message) => (
        <Fragment key={message.id}>
          <div
            className={`rounded-card border border-app p-4 shadow-press ${
              message.role === "assistant" ? "bg-surface" : "bg-app"
            }`}
          >
            <p className="text-sm text-app whitespace-pre-wrap">{message.content}</p>
            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Citations</p>
                <ul className="space-y-1">
                  {message.citations.map((citation) => (
                    <li key={citation.url}>
                      <a
                        className="text-sm text-accent-nexus underline"
                        href={citation.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {citation.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Fragment>
      ))}
      <div ref={endRef} />
    </div>
  );
}
