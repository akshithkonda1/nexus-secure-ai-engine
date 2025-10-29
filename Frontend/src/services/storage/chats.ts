import { nanoid } from "nanoid";

export type ChatStatus = "active" | "archived" | "trash";
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  title: string;
  status: ChatStatus;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const CHATS_KEY = "nexus.chats";

const defaultMessage: ChatMessage = {
  id: nanoid(),
  role: "assistant",
  content: "Welcome to Nexus — where adaptive AIs collaborate to help you think faster.",
  createdAt: new Date().toISOString(),
};

const defaultChat: ChatThread = {
  id: nanoid(),
  title: "First conversation",
  status: "active",
  messages: [defaultMessage],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function loadChats(): ChatThread[] {
  if (typeof window === "undefined") {
    return [defaultChat];
  }

  try {
    const raw = window.localStorage.getItem(CHATS_KEY);
    if (!raw) {
      const seeded = [defaultChat];
      window.localStorage.setItem(CHATS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [defaultChat];
    }
    return parsed.map((chat) => ({
      ...chat,
      messages: chat.messages ?? [],
      status: chat.status ?? "active",
    }));
  } catch (error) {
    console.error("Failed to parse chats", error);
    return [defaultChat];
  }
}

function persist(chats: ChatThread[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

function mutateChats(mutator: (chats: ChatThread[]) => ChatThread[]): ChatThread[] {
  const updated = mutator(loadChats());
  persist(updated);
  return updated;
}

export function listChats(status?: ChatStatus): ChatThread[] {
  const chats = loadChats();
  if (!status) {
    return chats;
  }
  return chats.filter((chat) => chat.status === status);
}

export function getChatById(id: string): ChatThread | undefined {
  return loadChats().find((chat) => chat.id === id);
}

export function createChat(initialTitle?: string): ChatThread {
  const now = new Date().toISOString();
  const chat: ChatThread = {
    id: nanoid(),
    title: initialTitle ?? "Untitled chat",
    status: "active",
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

  mutateChats((chats) => [chat, ...chats]);
  return chat;
}

export function addMessage(chatId: string, message: Omit<ChatMessage, "id" | "createdAt">): ChatThread | undefined {
  let result: ChatThread | undefined;
  mutateChats((chats) =>
    chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }
      const newMessage: ChatMessage = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        ...message,
      };
      result = {
        ...chat,
        messages: [...chat.messages, newMessage],
        updatedAt: new Date().toISOString(),
      };
      return result;
    })
  );
  return result;
}

export function renameChat(chatId: string, title: string): ChatThread | undefined {
  let result: ChatThread | undefined;
  mutateChats((chats) =>
    chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }
      result = { ...chat, title, updatedAt: new Date().toISOString() };
      return result;
    })
  );
  return result;
}

export function setChatStatus(chatId: string, status: ChatStatus): ChatThread | undefined {
  let result: ChatThread | undefined;
  mutateChats((chats) =>
    chats.map((chat) => {
      if (chat.id !== chatId) {
        return chat;
      }
      result = { ...chat, status, updatedAt: new Date().toISOString() };
      return result;
    })
  );
  return result;
}

export function deleteChatPermanently(chatId: string): void {
  mutateChats((chats) => chats.filter((chat) => chat.id !== chatId));
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
  const chats = loadChats();
  if (chats.length === 0) {
    const created = createChat("Welcome chat");
    return created;
  }
  return chats[0];
}
