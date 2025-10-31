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
    },
    [addMessage, ensureChat, mutation]
  );

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  return (
    <div className="flex h-full flex-col gap-6">
      <ChatTabs chats={chats} activeChatId={activeChatId} onSelect={setActiveChatId} />
      <div className="flex flex-1 flex-col gap-6 rounded-card border border-app bg-app p-6 shadow-ambient">
        <ChatList chat={activeChat} />
        <PromptBar onSubmit={handleSubmit} disabled={mutation.isPending} />
        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          Nexus is an experimental AI Orchestration Engine and will, like any GenAI engine, make mistakes. But Nexus will try to
          give the most accurate answers to any question.
        </p>
      </div>
    </div>
  );
}
