// Frontend/src/consumer/useConversations.ts
import { useEffect, useMemo, useState } from "react";
import {
  Conversation, ConversationStatus, Message,
  deleteConversation, emptyTrash, getConversation, listConversations, putConversation
} from "./db";

const uid = () => Math.random().toString(36).slice(2);
const now = () => Date.now();

export function useConversations() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Load once
  useEffect(() => {
    listConversations().then(setConvos).catch(console.error);
  }, []);

  const current = useMemo(
    () => convos.find(c => c.id === currentId) || null,
    [convos, currentId]
  );

  // CRUD helpers
  async function save(c: Conversation) {
    const copy = { ...c, updatedAt: now() };
    await putConversation(copy);
    setConvos(prev => {
      const idx = prev.findIndex(x => x.id === copy.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = copy;
        return next.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      return [copy, ...prev].sort((a, b) => b.updatedAt - a.updatedAt);
    });
    return copy;
  }

  function startNew(title = "New chat"): Promise<Conversation> {
    const c: Conversation = {
      id: uid(),
      title,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
      messages: []
    };
    setCurrentId(c.id);
    return save(c);
  }

  async function rename(id: string, title: string) {
    const c = convos.find(x => x.id === id);
    if (!c) return;
    await save({ ...c, title });
  }

  async function select(id: string) {
    const c = await getConversation(id);
    if (c) setCurrentId(c.id);
  }

  async function append(id: string, m: Message) {
    const c = convos.find(x => x.id === id);
    if (!c) return;
    await save({ ...c, messages: [...c.messages, m] });
  }

  async function updateLastAssistant(id: string, patch: Partial<Message>) {
    const c = convos.find(x => x.id === id);
    if (!c) return;
    const msgs = [...c.messages];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant") {
        msgs[i] = { ...msgs[i], ...patch };
        break;
      }
    }
    await save({ ...c, messages: msgs });
  }

  async function setStatus(id: string, status: ConversationStatus) {
    const c = convos.find(x => x.id === id);
    if (!c) return;
    await save({ ...c, status });
  }

  async function archive(id: string) { await setStatus(id, "archived"); }
  async function moveToTrash(id: string) { await setStatus(id, "trash"); if (currentId === id) setCurrentId(null); }
  async function restore(id: string) { await setStatus(id, "active"); }
  async function purge(id: string) {
    await deleteConversation(id);
    setConvos(prev => prev.filter(x => x.id !== id));
    if (currentId === id) setCurrentId(null);
  }
  async function purgeAllTrash() {
    await emptyTrash();
    setConvos(prev => prev.filter(x => x.status !== "trash"));
    if (current?.status === "trash") setCurrentId(null);
  }

  const active = useMemo(() => convos.filter(c => c.status === "active"), [convos]);
  const archived = useMemo(() => convos.filter(c => c.status === "archived"), [convos]);
  const trash = useMemo(() => convos.filter(c => c.status === "trash"), [convos]);

  return {
    convos, active, archived, trash,
    current, currentId, setCurrentId,
    startNew, rename, select, append, updateLastAssistant,
    archive, moveToTrash, restore, purge, purgeAllTrash
  };
}
