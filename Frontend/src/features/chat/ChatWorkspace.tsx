import { useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSessionStore } from "@/shared/state/session";
import { useChatStore } from "@/shared/state/chats";
import { apiPost, type ChatReplyResponse } from "@/services/api/client";
import { ChatTabs } from "@/features/chat/ChatTabs";
import { ChatList } from "@/features/chat/ChatList";
import { PromptBar } from "@/features/chat/PromptBar";

export function ChatWorkspace() {
  const chats = useChatStore((state) => state.chats);
  const createChat = useChatStore((state) => state.createChat);
  const addMessage = useChatStore((state) => state.addMessage);
  const refreshChats = useChatStore((state) => state.refresh);
  const activeChatId = useSessionStore((state) => state.activeChatId);
  const setActiveChatId = useSessionStore((state) => state.setActiveChatId);

  const ensureChat = useCallback(() => {
    if (activeChatId) {
      return activeChatId;
    }
    if (chats.length > 0) {
      const first = chats[0].id;
      setActiveChatId(first);
      return first;
    }
    const created = createChat();
    setActiveChatId(created.id);
    return created.id;
  }, [activeChatId, chats, createChat, setActiveChatId]);

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats, setActiveChatId]);

  const mutation = useMutation({
    mutationFn: (prompt: string) => apiPost<{ message: string }, ChatReplyResponse>("/chat/reply", { message: prompt }),
    onSettled: () => {
      refreshChats();
    }
  });

  const handleSubmit = useCallback(
    async (prompt: string) => {
      const chatId = ensureChat();
      addMessage(chatId, { role: "user", content: prompt });
      const response = await mutation.mutateAsync(prompt);
      addMessage(chatId, {
        role: "assistant",
        content: response.content,
        citations: response.citations
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

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <div className="flex h-full flex-col gap-6">
      <ChatTabs chats={chats} activeChatId={activeChatId} onSelect={setActiveChatId} />
      <div className="flex flex-1 flex-col gap-6 rounded-card border border-app bg-app p-6 shadow-ambient">
        <ChatList chat={activeChat} />
        <PromptBar onSubmit={handleSubmit} disabled={mutation.isPending} />
      </div>
    </div>
  );
}
