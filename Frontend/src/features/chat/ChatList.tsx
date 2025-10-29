import { Archive, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/cn";
import type { ChatThread } from "@/services/storage/chats";

interface ChatListProps {
  chats: ChatThread[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onArchive: (chatId: string) => void;
  onTrash: (chatId: string) => void;
  onRestore: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

export function ChatList({ chats, activeChatId, onSelectChat, onArchive, onTrash, onRestore, onDelete }: ChatListProps): JSX.Element {
  const active = chats.filter((chat) => chat.state === "active");
  const archived = chats.filter((chat) => chat.state === "archived");
  const trash = chats.filter((chat) => chat.state === "trashed");

  return (
    <div className="space-y-6">
      <ChatSection
        title={`Active (${active.length})`}
        chats={active}
        activeChatId={activeChatId}
        onSelect={onSelectChat}
        actions={({ id }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Chat actions" className="round-btn">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onArchive(id)}>Archive</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onTrash(id)}>Move to trash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <ChatSection
        title={`Archived (${archived.length})`}
        chats={archived}
        activeChatId={activeChatId}
        onSelect={onSelectChat}
        actions={({ id }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Archived chat actions" className="round-btn">
                <Archive className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onRestore(id)}>Restore</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onTrash(id)}>Move to trash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
      <ChatSection
        title={`Trash (${trash.length})`}
        chats={trash}
        activeChatId={activeChatId}
        onSelect={onSelectChat}
        actions={({ id }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Trash chat actions" className="round-btn">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onRestore(id)}>Restore</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(id)}>Delete permanently</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}

interface ChatSectionProps {
  title: string;
  chats: ChatThread[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  actions: (chat: ChatThread) => React.ReactNode;
}

function ChatSection({ title, chats, activeChatId, onSelect, actions }: ChatSectionProps) {
  return (
    <section>
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <div className="mt-2 space-y-1">
        {chats.length === 0 ? (
          <p className="px-2 text-xs text-muted">Nothing here yet.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center justify-between round-card px-3 py-2 text-sm transition hover:bg-[var(--app-muted)]",
                chat.id === activeChatId ? "bg-[var(--app-muted)]" : "bg-[var(--app-surface)] shadow-ambient border border-subtle/60"
              )}
            >
              <button
                type="button"
                className="flex-1 truncate text-left"
                onClick={() => onSelect(chat.id)}
              >
                <p className="truncate font-medium">{chat.title}</p>
                <p className="text-xs text-muted">{new Date(chat.updatedAt).toLocaleString()}</p>
              </button>
              {actions(chat)}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
