import { X } from "lucide-react";
import { useSessionStore } from "../../shared/state/session";
import { cn } from "../../shared/lib/cn";
import { Button } from "../../shared/ui/button";
import { useMemo } from "react";
import { ChatRecord } from "../../services/storage/chats";

interface ChatTabsProps {
  chats: ChatRecord[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
}

export function ChatTabs({ chats, activeChatId, onSelect }: ChatTabsProps) {
  const openChatIds = useSessionStore((state) => state.openChatIds);
  const closeChat = useSessionStore((state) => state.closeChat);

  const openChats = useMemo(() => openChatIds.map((id) => chats.find((chat) => chat.id === id)).filter(Boolean), [
    chats,
    openChatIds,
  ]) as ChatRecord[];

  if (openChats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-subtle bg-surface/60 px-4 py-2">
      {openChats.map((chat) => (
        <button
          key={chat.id}
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
            activeChatId === chat.id
              ? "border-indigo-500/60 bg-accent-soft text-white"
              : "border-transparent bg-slate-900/10 text-muted hover:bg-slate-900/20",
          )}
          onClick={() => onSelect(chat.id)}
        >
          <span className="max-w-[160px] truncate">{chat.title}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 rounded-full p-0 text-xs"
            onClick={(event) => {
              event.stopPropagation();
              closeChat(chat.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </button>
      ))}
    </div>
  );
}
