import { useEffect, useMemo, useState } from "react";
import {
  Conversation, ConversationStatus, Message,
  deleteConversation, emptyTrash, getConversation, listConversations, putConversation
} from "./db";

const uid = () => Math.random().toString(36).slice(2);
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
        setConvos(items);
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setCurrentId(prev => {
      if (convos.length === 0) return null;
      if (prev && convos.some(c => c.id === prev)) return prev;
      return convos[0].id;
    });
  }, [convos]);

  useEffect(() => {
    const id = currentId;
    if (!id) return;
    let cancelled = false;
    getConversation(id)
      .then(conv => {
        if (cancelled) return;
        if (!conv) {
          setConvos(prev => prev.filter(x => x.id !== id));
          return;
        }
        setConvos(prev => {
          const idx = prev.findIndex(x => x.id === conv.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = conv;
            return sortConversations(next);
          }
          return sortConversations([conv, ...prev]);
        });
      })
      .catch(err => {
        console.error(err);
        setConvos(prev => prev.filter(x => x.id !== id));
      });
    return () => { cancelled = true; };
  }, [currentId]);

  const current = useMemo(
    () => (currentId ? convos.find(c => c.id === currentId) ?? null : null),
    [convos, currentId]
  );

  async function save(c: Conversation) {
    const copy = { ...c, updatedAt: now() };
    await putConversation(copy);
    setConvos(prev => {
      const idx = prev.findIndex(x => x.id === copy.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = copy;
        return sortConversations(next);
      }
      return sortConversations([copy, ...prev]);
    });
    return copy;
  }

  async function startNew(title = "New chat") {
    const created = now();
    const c: Conversation = { id: uid(), title, status: "active", createdAt: created, updatedAt: created, messages: [] };
    setConvos(prev => sortConversations([c, ...prev.filter(x => x.id !== c.id)]));
    setCurrentId(c.id);
    return save(c);
  }

  async function rename(id: string, title: string) {
    const c = convos.find(x => x.id === id); if (!c) return;
    await save({ ...c, title });
  }

  async function select(id: string) {
    setCurrentId(id);
  }

  async function append(id: string, m: Message) {
    const base = convos.find(x => x.id === id);
    if (!base) return;
    await save({ ...base, messages: [...base.messages, m] });
  }

  async function updateLastAssistant(id: string, patch: Partial<Message>) {
    const base = convos.find(x => x.id === id);
    if (!base) return;
    const msgs = [...base.messages];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "assistant") { msgs[i] = { ...msgs[i], ...patch }; break; }
    }
    await save({ ...base, messages: msgs });
  }

  async function setStatus(id: string, status: ConversationStatus) {
    const base = convos.find(x => x.id === id);
    if (!base) return;
    await save({ ...base, status });
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

  return { convos, active, archived, trash, current, currentId, setCurrentId,
           startNew, rename, select, append, updateLastAssistant,
           archive, moveToTrash, restore, purge, purgeAllTrash };
}
