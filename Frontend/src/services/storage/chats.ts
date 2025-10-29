import { nanoid } from "nanoid";
import { NexusMode } from "../../shared/state/session";

export type ChatStatus = "active" | "archived" | "trashed";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatRecord {
  id: string;
  title: string;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  mode: NexusMode;
  messages: ChatMessage[];
}

const CHAT_STORAGE_KEY = "nexus.chats";

function defaultTitle(): string {
  return "Untitled chat";
}

function parseChat(raw: unknown): ChatRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<ChatRecord>;
  if (typeof data.id !== "string" || typeof data.status !== "string") return null;
  return {
    id: data.id,
    title: typeof data.title === "string" ? data.title : defaultTitle(),
    status: data.status === "archived" || data.status === "trashed" ? data.status : "active",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString(),
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
    mode: data.mode === "business" || data.mode === "nexusos" ? data.mode : "student",
    messages: Array.isArray(data.messages)
      ? data.messages.filter((message): message is ChatMessage =>
          !!message &&
          typeof message === "object" &&
          typeof (message as ChatMessage).id === "string" &&
          (message as ChatMessage).role !== undefined &&
          (message as ChatMessage).content !== undefined,
        )
      : [],
  };
}

export function readChats(): ChatRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseChat).filter((chat): chat is ChatRecord => chat !== null);
  } catch (error) {
    console.warn("Failed to parse chat history", error);
    return [];
  }
}

export function writeChats(chats: ChatRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  window.dispatchEvent(new CustomEvent("nexus:chats-updated"));
}

export function getChat(id: string): ChatRecord | undefined {
  return readChats().find((chat) => chat.id === id);
}

export function createChat(mode: NexusMode, title?: string): ChatRecord {
  const timestamp = new Date().toISOString();
  const chat: ChatRecord = {
    id: nanoid(),
    title: title?.trim() || defaultTitle(),
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp,
    mode,
    messages: [],
  };
  const chats = readChats();
  chats.unshift(chat);
  writeChats(chats);
  return chat;
}

export function saveMessage(chatId: string, role: ChatMessage["role"], content: string): ChatRecord | undefined {
  const chats = readChats();
  const index = chats.findIndex((chat) => chat.id === chatId);
  if (index === -1) return undefined;
  const message: ChatMessage = {
    id: nanoid(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  const chat = chats[index];
  const updated: ChatRecord = {
    ...chat,
    messages: [...chat.messages, message],
    updatedAt: message.createdAt,
  };
  chats[index] = updated;
  writeChats(chats);
  return updated;
}

export function renameChat(chatId: string, title: string): ChatRecord | undefined {
  const chats = readChats();
  const index = chats.findIndex((chat) => chat.id === chatId);
  if (index === -1) return undefined;
  const updated = { ...chats[index], title: title.trim() || defaultTitle(), updatedAt: new Date().toISOString() };
  chats[index] = updated;
  writeChats(chats);
  return updated;
}

export function moveChat(chatId: string, status: ChatStatus): ChatRecord | undefined {
  const chats = readChats();
  const index = chats.findIndex((chat) => chat.id === chatId);
  if (index === -1) return undefined;
  const updated = { ...chats[index], status, updatedAt: new Date().toISOString() };
  chats[index] = updated;
  writeChats(chats);
  return updated;
}

export function deleteChat(chatId: string): void {
  const chats = readChats();
  const filtered = chats.filter((chat) => chat.id !== chatId);
  writeChats(filtered);
}

export function searchChats(query: string): ChatRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return readChats();
  return readChats().filter((chat) =>
    chat.title.toLowerCase().includes(normalized) ||
    chat.messages.some((message) => message.content.toLowerCase().includes(normalized)),
  );
}
