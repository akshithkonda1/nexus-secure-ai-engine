import { useEffect, useMemo, useState } from "react";
import { Archive, FileDown, Trash2 } from "lucide-react";
import { ChatRecord, ChatStatus, createChat, moveChat, readChats, saveMessage } from "../../services/storage/chats";
import { ChatTabs } from "./ChatTabs";
import { ChatList } from "./ChatList";
import { PromptBar } from "./PromptBar";
import { useSessionStore } from "../../shared/state/session";
import { useToast } from "../../shared/ui/use-toast";
import { api } from "../../services/api/client";
import { useUIStore } from "../../shared/state/ui";

function ensureChatSelected(chats: ChatRecord[], activeChatId: string | null, setActive: (id: string) => void) {
  if (!activeChatId && chats.length > 0) {
    setActive(chats[0].id);
  }
}

export function ChatWorkspace() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const activeChatId = useSessionStore((state) => state.activeChatId);
  const setActiveChatId = useSessionStore((state) => state.setActiveChatId);
  const openChat = useSessionStore((state) => state.openChat);
  const mode = useSessionStore((state) => state.mode);
  const { toast } = useToast();
  const setActivePane = useUIStore((state) => state.setActiveSystemPane);
  const setSystemDrawerOpen = useUIStore((state) => state.setSystemDrawerOpen);

  useEffect(() => {
    setChats(readChats());
    const handler = () => setChats(readChats());
    window.addEventListener("nexus:chats-updated", handler);
    return () => window.removeEventListener("nexus:chats-updated", handler);
  }, []);

  useEffect(() => {
    ensureChatSelected(chats, activeChatId, (id) => {
      setActiveChatId(id);
      openChat(id);
    });
  }, [activeChatId, chats, openChat, setActiveChatId]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [activeChatId, chats],
  );

  const counts = useMemo(() => {
    return {
      active: chats.filter((chat) => chat.status === "active").length,
      archived: chats.filter((chat) => chat.status === "archived").length,
      trashed: chats.filter((chat) => chat.status === "trashed").length,
    };
  }, [chats]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    openChat(chatId);
  };

  const handleMoveChat = (chatId: string, status: ChatStatus) => {
    moveChat(chatId, status);
    setChats(readChats());
    if (status !== "active" && activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const handleSendPrompt = (prompt: string) => {
    let targetChat = activeChat;
    if (!targetChat) {
      targetChat = createChat(mode, prompt.slice(0, 40));
      setChats(readChats());
      handleSelectChat(targetChat.id);
    }
    saveMessage(targetChat.id, "user", prompt);
    saveMessage(
      targetChat.id,
      "assistant",
      `(${mode}) Nexus agents are synthesizing: ${prompt.slice(0, 120)}...`,
    );
    setChats(readChats());
  };

  const handleQuickAction = async (action: string) => {
    if (action === "dummy-pack") {
      await api("library/create-dummy-study-pack");
      setSystemDrawerOpen(true);
      setActivePane("library");
      toast({ title: "Library updated", description: "Dummy study pack added to the Library pane." });
      return;
    }
    if (action === "explain") {
      handleSendPrompt("Explain this topic as if I were new to it.");
      return;
    }
    if (action === "summarize") {
      handleSendPrompt("Summarize the active discussion into key insights.");
    }
  };

  const handleExport = () => {
    toast({ title: "Transcript exported", description: "A sanitized log was prepared for download." });
  };

  const handleArchive = () => {
    if (!activeChat) return;
    handleMoveChat(activeChat.id, "archived");
    toast({ title: "Chat archived", description: `${activeChat.title} is resting in archives.` });
  };

  const handleDelete = () => {
    if (!activeChat) return;
    handleMoveChat(activeChat.id, "trashed");
    toast({ title: "Chat moved to trash", description: `${activeChat.title} can be restored from Trash.` });
  };

  return (
    <div className="flex h-full w-full">
      <ChatList chats={chats} activeChatId={activeChatId} onSelect={handleSelectChat} onMove={handleMoveChat} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-subtle bg-surface/80 px-6 py-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
            <span>Active {counts.active}</span>
            <span>Archived {counts.archived}</span>
            <span>Trash {counts.trashed}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-subtle px-3 py-1.5 text-xs text-muted hover:border-indigo-400 hover:text-white"
              onClick={handleExport}
            >
              <FileDown className="h-3.5 w-3.5" /> Export
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-subtle px-3 py-1.5 text-xs text-muted hover:border-indigo-400 hover:text-white"
              onClick={handleArchive}
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-subtle px-3 py-1.5 text-xs text-muted hover:border-red-400 hover:text-red-300"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
        <ChatTabs chats={chats} activeChatId={activeChatId} onSelect={handleSelectChat} />
        <div className="flex-1 overflow-y-auto bg-surface/60 px-8 py-6">
          {activeChat ? (
            <div className="flex flex-col gap-4">
              {activeChat.messages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-subtle bg-slate-900/5 p-10 text-center text-sm text-muted">
                  Nexus is standing by. Ask a question or use a quick action.
                </div>
              ) : (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[70%] rounded-lg border border-indigo-400/40 bg-accent-soft/70 px-4 py-3 text-sm text-white shadow"
                        : "max-w-[70%] rounded-lg border border-subtle bg-surface px-4 py-3 text-sm text-muted"
                    }
                  >
                    <div className="mb-1 text-xs uppercase tracking-wide text-muted/70">
                      {message.role === "user" ? "You" : "Nexus"}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Start a conversation to begin collaborating with Nexus.
            </div>
          )}
        </div>
        <PromptBar onSend={handleSendPrompt} onQuickAction={handleQuickAction} />
      </div>
    </div>
  );
}
