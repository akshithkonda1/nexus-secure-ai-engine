import { create } from "zustand";
import {
  appendMessage,
  Chat,
  createChat as createChatStorage,
  deletePermanent,
  listChats,
  moveToTrash,
  restoreFromTrash
} from "@/services/storage/chats";

interface ChatStore {
  chats: Chat[];
  refresh: () => void;
  createChat: () => Chat;
  addMessage: (chatId: string, message: Parameters<typeof appendMessage>[1]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: listChats("active"),
  refresh: () => set({ chats: listChats("active") }),
  createChat: () => {
    const chat = createChatStorage();
    get().refresh();
    return chat;
  },
  addMessage: (chatId, message) => {
    appendMessage(chatId, message);
    get().refresh();
  }
}));

export const chatActions = {
  moveToTrash: (chatId: string) => {
    moveToTrash(chatId);
    useChatStore.getState().refresh();
  },
  restoreFromTrash: (chatId: string) => {
    restoreFromTrash(chatId);
    useChatStore.getState().refresh();
  },
  deleteChat: (chatId: string) => {
    deletePermanent(chatId);
    useChatStore.getState().refresh();
  }
};
