import { useEffect, useMemo, useState } from "react";
import { Conversation, Message } from "./types";
import { deleteConversation, emptyTrash, listConversations, putConversation } from "./db";

const uid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const now = () => Date.now();

export function useConversations() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => { listConversations().then(setConvos).catch(console.error); }, []);
  const current = useMemo(() => convos.find(c => c.id === currentId) || null, [convos, currentId]);

  async function save(c: Conversation) {
    const copy = { ...c, updatedAt: now() };
    await putConversation(copy);
    setConvos(prev => {
      const i = prev.findIndex(x => x.id === copy.id);
      if (i >= 0) { const next = [...prev]; next[i] = copy; return next.sort((a,b)=>b.updatedAt-a.updatedAt); }
      return [copy, ...prev].sort((a,b)=>b.updatedAt-a.updatedAt);
    });
    return copy;
  }

  async function ensureCurrent() {
    if (current) return current;
    const c: Conversation = { id: uid(), title: "New chat", status: "active", createdAt: now(), updatedAt: now(), messages: [] };
    setCurrentId(c.id);
    return await save(c);
  }

  async function rename(id: string, title: string) {
    const c = convos.find(x => x.id === id); if (!c) return;
    await save({ ...c, title });
  }

  async function append(id: string, m: Message) {
    const c = convos.find(x => x.id === id); if (!c) return;
    await save({ ...c, messages: [...c.messages, m] });
  }

  async function updateMessage(id: string, msgId: string, patch: Partial<Message>) {
    const c = convos.find(x => x.id === id); if (!c) return;
    const msgs = c.messages.map(m => m.id === msgId ? { ...m, ...patch } : m);
    await save({ ...c, messages: msgs });
  }

  async function setStatus(id: string, status: Conversation["status"]) {
    const c = convos.find(x => x.id === id); if (!c) return;
    await save({ ...c, status });
  }

  async function purge(id: string) {
    await deleteConversation(id);
    setConvos(prev => prev.filter(x => x.id !== id));
    if (currentId === id) setCurrentId(null);
  }

  async function purgeAllTrash() { await emptyTrash(); setConvos(prev => prev.filter(x => x.status !== "trash")); }

  return {
    convos, current, currentId, setCurrentId,
    ensureCurrent, rename, append, updateMessage, setStatus, purge, purgeAllTrash
  };
}
