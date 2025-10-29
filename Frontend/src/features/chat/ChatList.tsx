import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { ChatRecord, ChatStatus } from "../../services/storage/chats";
import { cn } from "../../shared/lib/cn";
import { Button } from "../../shared/ui/button";

interface ChatListProps {
  chats: ChatRecord[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  onMove: (chatId: string, status: ChatStatus) => void;
}

const groups: { status: ChatStatus; title: string }[] = [
  { status: "active", title: "Active" },
  { status: "archived", title: "Archived" },
  { status: "trashed", title: "Trash" },
];

export function ChatList({ chats, activeChatId, onSelect, onMove }: ChatListProps) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-subtle bg-surface/60">
      {groups.map((group) => {
        const groupChats = chats.filter((chat) => chat.status === group.status);
        return (
          <div key={group.status} className="flex flex-col border-b border-subtle">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {group.title}
              <span className="text-[10px] text-muted/70">{groupChats.length}</span>
            </div>
            <div className="flex flex-col">
              {groupChats.length === 0 ? (
                <p className="px-4 py-6 text-xs text-muted/60">No conversations yet.</p>
              ) : (
                groupChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "flex flex-col gap-2 border-b border-transparent px-4 py-3 transition hover:bg-slate-900/10",
                      activeChatId === chat.id ? "border-l-2 border-indigo-400 bg-slate-900/10" : undefined,
                    )}
                  >
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => onSelect(chat.id)}
                    >
                      <div className="text-sm font-medium">{chat.title}</div>
                      <div className="text-xs text-muted">{new Date(chat.updatedAt).toLocaleString()}</div>
                    </button>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {group.status !== "active" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onMove(chat.id, "active")}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" /> Restore
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onMove(chat.id, "archived")}
                        >
                          <Archive className="mr-1 h-3 w-3" /> Archive
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => onMove(chat.id, "trashed")}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Trash
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
