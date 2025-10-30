import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/shared/state/session";
import { cn } from "@/shared/lib/cn";
import type { ChatThread } from "@/services/storage/chats";

interface ChatTabsProps {
  chats: ChatThread[];
  openChatIds: string[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: () => void;
  onClose: (chatId: string) => void;
}

export function ChatTabs({ chats, openChatIds, activeChatId, onSelect, onCreate, onClose }: ChatTabsProps): JSX.Element {
  const reorderOpenChats = useSessionStore((state) => state.reorderOpenChats);

  const handleReorder = (chatId: string) => {
    reorderOpenChats([...openChatIds.filter((id) => id !== chatId), chatId]);
  };

  return (
    <div className="flex items-center justify-between border-b border-subtle bg-[var(--app-surface)] px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {openChatIds.map((chatId) => {
          const chat = chats.find((entry) => entry.id === chatId);
          if (!chat) {
            return null;
          }
          const isActive = chatId === activeChatId;
          return (
            <button
              key={chatId}
              type="button"
              className={cn(
                "group flex shrink-0 items-center gap-2 round-btn border px-3 py-1.5 text-sm shadow-ambient",
                isActive ? "border-[var(--mode-accent-solid)] bg-[var(--app-muted)] text-primary" : "border-subtle/60 text-muted"
              )}
              onClick={() => {
                onSelect(chatId);
                handleReorder(chatId);
              }}
            >
              <span className="max-w-[160px] truncate">{chat.title}</span>
              <X
                className="h-3.5 w-3.5 cursor-pointer text-muted transition group-hover:text-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose(chatId);
                }}
              />
            </button>
          );
        })}
      </div>
      <Button size="icon" variant="ghost" className="round-btn shadow-press" onClick={onCreate} aria-label="Open new chat tab">
        +
      </Button>
    </div>
  );
}
