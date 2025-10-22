import { useCallback, useEffect, useMemo, useState } from "react";
import type { Conversation, ConversationStatus, Message } from "./types";
import { deleteConversation, emptyTrash, listConversations, putConversation } from "./db";

const uid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2));
const now = () => Date.now();

function sortConversations(items: Conversation[]) {
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function useConversations() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listConversations()
      .then(items => {
        if (cancelled) return;
        setConvos(sortConversations(items));
        if (items.length > 0) {
          setCurrentId(prev => (prev && items.some(c => c.id === prev) ? prev : items[0].id));
        }
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(
    () => (currentId ? convos.find(c => c.id === currentId) ?? null : null),
    [convos, currentId]
  );

  const save = useCallback(async (conv: Conversation) => {
    const copy: Conversation = { ...conv, updatedAt: now() };
    await putConversation(copy);
    setConvos(prev => {
      const idx = prev.findIndex(x => x.id === copy.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = copy;
        return sortConversations(next);
      }
      return sortConversations([...prev, copy]);
    });
    return copy;
  }, []);

  const createConversation = useCallback(async () => {
    const createdAt = now();
    const conv: Conversation = {
      id: uid(),
      title: "New chat",
      status: "active",
      createdAt,
      updatedAt: createdAt,
      messages: []
    };
    setConvos(prev => sortConversations([conv, ...prev]));
    setCurrentId(conv.id);
    await putConversation(conv);
    return conv;
  }, []);

  const ensureCurrent = useCallback(async () => {
    if (currentId) {
      const existing = convos.find(c => c.id === currentId);
      if (existing) return existing;
    }
    return createConversation();
  }, [convos, createConversation, currentId]);

  const startNew = useCallback(async () => {
    return createConversation();
  }, [createConversation]);

  const rename = useCallback(async (id: string, title: string) => {
    const base = convos.find(c => c.id === id);
    if (!base) return;
    await save({ ...base, title });
  }, [convos, save]);

  const append = useCallback(async (id: string, message: Message) => {
    const base = convos.find(c => c.id === id);
    if (!base) return;
    await save({ ...base, messages: [...base.messages, message] });
  }, [convos, save]);

  const updateMessage = useCallback(async (id: string, messageId: string, patch: Partial<Message>) => {
    const base = convos.find(c => c.id === id);
    if (!base) return;
    const msgs = base.messages.map(m => (m.id === messageId ? { ...m, ...patch } : m));
    await save({ ...base, messages: msgs });
  }, [convos, save]);

  const setStatus = useCallback(async (id: string, status: ConversationStatus) => {
    const base = convos.find(c => c.id === id);
    if (!base) return;
    await save({ ...base, status });
    if (status === "trash" && currentId === id) {
      setCurrentId(null);
    }
  }, [convos, currentId, save]);

  const purge = useCallback(async (id: string) => {
    await deleteConversation(id);
    setConvos(prev => prev.filter(c => c.id !== id));
    setCurrentId(prev => (prev === id ? null : prev));
  }, []);

  const purgeAllTrash = useCallback(async () => {
    await emptyTrash();
    setConvos(prev => prev.filter(c => c.status !== "trash"));
    setCurrentId(prev => {
      if (!prev) return prev;
      const conv = convos.find(c => c.id === prev);
      return conv && conv.status === "trash" ? null : prev;
    });
  }, [convos]);

  return {
    convos,
    current,
    currentId,
    setCurrentId,
    startNew,
    ensureCurrent,
    rename,
    append,
    updateMessage,
    setStatus,
    purge,
    purgeAllTrash
  };
}
