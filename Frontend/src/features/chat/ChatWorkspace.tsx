import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Archive, Download, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useThemeContext } from "@/shared/ui/theme/ThemeProvider";
import { useSessionStore } from "@/shared/state/session";
import { useUIStore } from "@/shared/state/ui";
import {
  addMessage,
  archiveChat,
  moveToTrash,
  renameChat,
  type ChatThread,
} from "@/services/storage/chats";
import { api } from "@/services/api/client";
import { useAppContext } from "@/app/AppShell";
import { ChatTabs } from "@/features/chat/ChatTabs";
import { PromptBar } from "@/features/chat/PromptBar";
import { cn } from "@/shared/lib/cn";

interface AssistantReply {
  role: "assistant";
  content: string;
  citations?: { title: string; url: string }[];
}

function useChatCounts(chats: ChatThread[]) {
  return useMemo(() => {
    return {
      active: chats.filter((chat) => chat.state === "active").length,
      archived: chats.filter((chat) => chat.state === "archived").length,
      trashed: chats.filter((chat) => chat.state === "trashed").length,
    };
  }, [chats]);
}

export function ChatWorkspace(): JSX.Element {
  const navigate = useNavigate();
  const { chats, refreshChats, createAndOpenChat, selectChat } = useAppContext();
  const { push } = useToast();
  const { mode } = useThemeContext();
  const openChatIds = useSessionStore((state) => state.openChatIds);
  const activeChatId = useSessionStore((state) => state.activeChatId);
  const closeOpenChatId = useSessionStore((state) => state.closeOpenChatId);
  const setSystemPane = useUIStore((state) => state.setSystemPane);

  const [input, setInput] = useState("");
  const [isSending, setSending] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const bannerTimeout = useRef<number | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const counts = useChatCounts(chats);

  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      const first = chats[0];
      selectChat(first.id);
    }
  }, [activeChat, chats, selectChat]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [activeChat?.messages]);

  useEffect(() => {
    return () => {
      if (bannerTimeout.current) {
        window.clearTimeout(bannerTimeout.current);
      }
    };
  }, []);

  const handleSend = async (prompt: string) => {
    const content = prompt.trim();
    if (!content || isSending) {
      return;
    }

    setSending(true);
    let chat = activeChat;

    try {
      if (!chat) {
        chat = createAndOpenChat();
        selectChat(chat.id);
      }

      addMessage(chat.id, { role: "user", content });
      renameChat(chat.id, deriveTitle(content));
      setInput("");
      refreshChats();

      const reply = await api<AssistantReply>("/chat/reply", {
        method: "POST",
        body: JSON.stringify({ message: content }),
      });

      addMessage(chat.id, {
        role: "assistant",
        content: reply.content,
        citations: reply.citations,
      });
      refreshChats();
    } catch (error) {
      console.error(error);
      push({
        title: "Message failed",
        description: "We hit a hiccup generating the reply. Try again in a moment.",
      });
    } finally {
      setSending(false);
    }
    addMessage(chat.id, { role: "user", content });
    renameChat(chat.id, deriveTitle(content));
    addMessage(chat.id, { role: "assistant", content: synthesizeAssistantResponse(mode, content) });
    refreshChats();
    setInput("");
    setSending(false);
  };

  const handleArchive = () => {
    if (!activeChat) return;
    archiveChat(activeChat.id);
    closeOpenChatId(activeChat.id);
    push({ title: "Chat archived", description: "Find it under the archived section anytime." });
    refreshChats();
  };

  const handleTrash = () => {
    if (!activeChat) return;
    moveToTrash(activeChat.id);
    closeOpenChatId(activeChat.id);
    push({ title: "Chat moved to trash", description: "Restore within 30 days to keep the transcript." });
    refreshChats();
  };

  const handleExport = async () => {
    if (!activeChat) return;
    const exportText = activeChat.messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(exportText);
      push({ title: "Transcript copied", description: "Paste into docs or share with your team." });
    } catch (error) {
      console.warn("Clipboard copy failed", error);
      push({ title: "Unable to copy", description: "Download the export from the toolbar instead." });
    }
  };

  const handleCreateStudyPack = async () => {
    setSystemPane("library");
    await api("/library/dummy-study-pack", { method: "POST" });
    setBannerMessage("Library refreshed");
    if (bannerTimeout.current) {
      window.clearTimeout(bannerTimeout.current);
    }
    bannerTimeout.current = window.setTimeout(() => {
      setBannerMessage(null);
    }, 4000);
    push({ title: "Study pack generated", description: "Open the System space to review the new study pack." });
    navigate("/system?tab=library");
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      <header className="border-b border-subtle bg-[var(--app-surface)] px-6 py-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Mode — {modeLabel(mode)}</p>
            <h2 className="text-2xl font-semibold">{activeChat?.title ?? "New chat"}</h2>
            <p className="text-xs text-muted">Active {counts.active} · Archived {counts.archived} · Trash {counts.trashed}</p>
            {bannerMessage ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--app-muted)] px-3 py-1 text-sm">
                <Sparkles className="h-4 w-4 text-[var(--mode-accent-solid)]" aria-hidden="true" />
                {bannerMessage}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="round-btn" onClick={handleExport} disabled={!activeChat}>
              <Download className="mr-2 h-4 w-4" /> Export transcript
            </Button>
            <Button variant="outline" className="round-btn" onClick={handleArchive} disabled={!activeChat}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
            <Button variant="destructive" className="round-btn" onClick={handleTrash} disabled={!activeChat}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </header>
      <ChatTabs
        chats={chats}
        openChatIds={openChatIds}
        activeChatId={activeChatId}
        onSelect={(id) => selectChat(id)}
        onCreate={() => {
          const newChat = createAndOpenChat();
          selectChat(newChat.id);
        }}
        onClose={(id) => closeOpenChatId(id)}
      />
      <div ref={transcriptRef} className="flex-1 overflow-y-auto bg-app px-6 py-6">
        {activeChat ? (
          <div className="space-y-4">
            {activeChat.messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className={cn(
                  "round-card border border-subtle/60 bg-[var(--app-surface)] p-5 shadow-ambient",
                  message.role === "assistant" ? "ml-auto max-w-[70%]" : "mr-auto max-w-[70%]"
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{message.role}</p>
                <div className="mt-2 space-y-3 text-sm leading-relaxed">{renderContent(message.content)}</div>
                {message.citations && message.citations.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <a
                        key={citation.url}
                        href={citation.url}
                        target="_blank"
                        rel="noreferrer"
                        className="round-btn border border-subtle/50 bg-[var(--app-muted)] px-3 py-1 text-xs text-muted transition hover:bg-[var(--app-muted)]/80"
                      >
                        {citation.title}
                      </a>
                    ))}
                  </div>
                ) : null}
                <p className="mt-3 text-[10px] uppercase tracking-wide text-muted">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            Start a new conversation to activate your workspace.
          </div>
        )}
      </div>
      <PromptBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onCreateStudyPack={handleCreateStudyPack}
        isSending={isSending}
      />
    </div>
  );
}

function deriveTitle(content: string): string {
  const clean = content.replace(/\s+/g, " ").trim();
  return clean.length > 32 ? `${clean.slice(0, 32)}…` : clean || "Untitled chat";
}

function modeLabel(mode: string) {
  if (mode === "student") {
    return "Student";
  }
  if (mode === "business") {
    return "Business";
  }
  return "Nexus OS";
}

function renderContent(content: string) {
  const segments = content.split("```");
  return segments.map((segment, index) => {
    const isCode = index % 2 === 1;
    if (isCode) {
      return (
        <pre key={index} className="round-card bg-black/80 p-3 text-xs text-white">
          <code className="font-mono">{segment.trim()}</code>
        </pre>
      );
    }
    return (
      <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
        {segment}
      </p>
    );
  });
}
