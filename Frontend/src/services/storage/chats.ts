import { nanoid } from "nanoid";

import { logEvent } from "@/shared/lib/audit";

export type ChatState = "active" | "archived" | "trashed";
export type ChatRole = "user" | "assistant" | "system";

export interface ChatCitation {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  citations?: ChatCitation[];
}

export interface ChatThread {
  id: string;
  title: string;
  state: ChatState;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "nexus.chats";

const seedMessage: ChatMessage = {
  id: nanoid(),
  role: "assistant",
  content: "Welcome to Nexus — where adaptive AIs collaborate to help you think faster.",
  createdAt: new Date().toISOString(),
};

const seedChat: ChatThread = {
  id: nanoid(),
  title: "First conversation",
  state: "active",
  messages: [seedMessage],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function loadAll(): ChatThread[] {
  if (typeof window === "undefined") {
    return [seedChat];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([seedChat]));
      return [seedChat];
    }
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [seedChat];
    }
    return parsed.map((chat) => ({
      ...chat,
      state: chat.state ?? (chat as unknown as { status?: ChatState }).status ?? "active",
      messages: (chat.messages ?? []).map((message) => ({ ...message })),
    }));
  } catch (error) {
    console.error("Failed to read chats", error);
    return [seedChat];
  }
}

function saveAll(list: ChatThread[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function updateAll(mutator: (list: ChatThread[]) => ChatThread[]): ChatThread[] {
  const next = mutator(loadAll());
  saveAll(next);
  return next;
}

export function listChats(state?: ChatState): ChatThread[] {
  const chats = loadAll();
  if (!state) {
    return chats;
  }
  return chats.filter((chat) => chat.state === state);
}

export function getChatById(id: string): ChatThread | undefined {
  return loadAll().find((chat) => chat.id === id);
}

export function createChat(initialTitle?: string): ChatThread {
  const now = new Date().toISOString();
  const chat: ChatThread = {
    id: nanoid(),
    title: initialTitle ?? "Untitled chat",
    state: "active",
    messages: [
      {
        id: nanoid(),
        role: "assistant",
        content: "How can Nexus assist you today?",
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  updateAll((all) => [chat, ...all]);
  logEvent("chat:create", { id: chat.id, title: chat.title });
  return chat;
}

export function addMessage(
  chatId: string,
  message: Omit<ChatMessage, "id" | "createdAt">
): ChatThread | undefined {
  let result: ChatThread | undefined;
  updateAll((all) =>
    all.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }
      const next: ChatMessage = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        ...message,
      };
      result = {
        ...chat,
        messages: [...chat.messages, next],
        updatedAt: new Date().toISOString(),
      };
      return result;
    })
  );
  return result;
}

export function renameChat(chatId: string, title: string): ChatThread | undefined {
  let result: ChatThread | undefined;
  updateAll((all) =>
    all.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }
      result = { ...chat, title, updatedAt: new Date().toISOString() };
      return result;
    })
  );
  if (result) {
    logEvent("chat:rename", { id: result.id, title: result.title });
  }
  return result;
}

function transitionState(id: string, state: ChatState): ChatThread | undefined {
  let result: ChatThread | undefined;
  updateAll((all) =>
    all.map((chat) => {
      if (chat.id !== id) {
        return chat;
      }
      result = { ...chat, state, updatedAt: new Date().toISOString() };
      return result;
    })
  );
  return result;
}

export function archiveChat(id: string) {
  const chat = transitionState(id, "archived");
  if (chat) {
    logEvent("chat:archive", { id: chat.id });
  }
}

export function moveToTrash(id: string) {
  const chat = transitionState(id, "trashed");
  if (chat) {
    logEvent("chat:trash", { id: chat.id });
  }
}

export function restoreFromTrash(id: string) {
  const chat = transitionState(id, "active");
  if (chat) {
    logEvent("chat:restore", { id: chat.id });
  }
}

export function deletePermanent(id: string) {
  updateAll((all) => all.filter((chat) => chat.id !== id));
  logEvent("chat:delete", { id });
}

export function ensureChat(chatId: string): ChatThread | undefined {
  const chat = getChatById(chatId);
  if (chat) {
    return chat;
  }
  const created = createChat();
  return created.id === chatId ? created : getChatById(chatId);
}

export function getOrCreateFirstChat(): ChatThread {
  const chats = loadAll();
  if (chats.length === 0) {
    const created = createChat("Welcome chat");
    return created;
  }
  return chats[0];
}
