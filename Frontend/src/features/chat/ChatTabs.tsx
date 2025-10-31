import { Chat } from "@/services/storage/chats";
import { Button } from "@/shared/ui/components/button";
import { cn } from "@/shared/lib/cn";

interface ChatTabsProps {
  chats: Chat[];
  activeChatId?: string;
  onSelect: (chatId: string) => void;
}

export function ChatTabs({ chats, activeChatId, onSelect }: ChatTabsProps) {
  if (chats.length === 0) {
    return null;
  }
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {chats.map((chat) => (
        <Button
          key={chat.id}
          variant={chat.id === activeChatId ? "default" : "ghost"}
          className={cn("rounded-button px-4", chat.id === activeChatId ? "shadow-ambient" : "")}
          onClick={() => onSelect(chat.id)}
        >
          {chat.title}
        </Button>
      ))}
    </div>
  );
}
