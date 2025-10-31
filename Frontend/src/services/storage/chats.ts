import { logEvent } from "@/shared/lib/audit";

export type ChatState = "active" | "archived" | "trashed";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: { title: string; url: string }[];
  createdAt: number;
};

export type Chat = {
  id: string;
  title: string;
  state: ChatState;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

const CHATS_KEY = "nexus.chats";

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Chat[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse chats", error);
    return [];
  }
}

function persist(chats: Chat[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function listChats(state: ChatState = "active"): Chat[] {
  return loadChats().filter((chat) => chat.state === state);
}

export function getChat(id: string): Chat | undefined {
  return loadChats().find((chat) => chat.id === id);
}

function writeChat(chat: Chat) {
  const chats = loadChats();
  const existingIndex = chats.findIndex((c) => c.id === chat.id);
  if (existingIndex >= 0) {
    chats[existingIndex] = chat;
  } else {
    chats.unshift(chat);
  }
  persist(chats);
}

export function createChat(): Chat {
  const now = Date.now();
  const chat: Chat = {
    id: generateId(),
    title: "New Conversation",
    state: "active",
    createdAt: now,
    updatedAt: now,
    messages: []
  };
  writeChat(chat);
  logEvent("chat.created", { id: chat.id });
  return chat;
}

export function appendMessage(chatId: string, message: Omit<ChatMessage, "id" | "createdAt">) {
  const chat = getChat(chatId);
  if (!chat) return;
  const entry: ChatMessage = { ...message, id: generateId(), createdAt: Date.now() };
  const messages = [...chat.messages, entry];
  const updated: Chat = { ...chat, messages, updatedAt: Date.now() };
  writeChat(updated);
  logEvent("chat.message", { chatId, role: entry.role });
}

export function renameChat(chatId: string, title: string) {
  const chat = getChat(chatId);
  if (!chat) return;
  writeChat({ ...chat, title, updatedAt: Date.now() });
  logEvent("chat.renamed", { chatId, title });
}

export function moveToTrash(chatId: string) {
  const chat = getChat(chatId);
  if (!chat) return;
  writeChat({ ...chat, state: "trashed", updatedAt: Date.now() });
  logEvent("chat.trashed", { chatId });
}

export function restoreFromTrash(chatId: string) {
  const chat = getChat(chatId);
  if (!chat) return;
  writeChat({ ...chat, state: "active", updatedAt: Date.now() });
  logEvent("chat.restored", { chatId });
}

export function archive(chatId: string) {
  const chat = getChat(chatId);
  if (!chat) return;
  writeChat({ ...chat, state: "archived", updatedAt: Date.now() });
  logEvent("chat.archived", { chatId });
}

export function deletePermanent(chatId: string) {
  const chats = loadChats();
  const filtered = chats.filter((chat) => chat.id !== chatId);
  persist(filtered);
  logEvent("chat.deleted", { chatId });
}
