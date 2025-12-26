/**
 * useChats Hook
 * Manages chat conversations connected to the Toron store
 * Design: Time-grouped, searchable, with CRUD operations
 */

import { useCallback, useMemo } from 'react';
import { useToronStore, type Chat } from '../stores/useToronStore';

interface ChatGroup {
  label: string;
  chats: Chat[];
}

interface UseChatsReturn {
  chats: Chat[];
  groupedChats: ChatGroup[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  createChat: (title?: string) => string;
  deleteChat: (chatId: string) => void;
  renameChat: (chatId: string, newTitle: string) => void;
  pinChat: (chatId: string) => void;
  unpinChat: (chatId: string) => void;
  duplicateChat: (chatId: string) => string;
}

export function useChats(): UseChatsReturn {
  // Get state from store
  const chats = useToronStore(state => state.chats);
  const searchQuery = useToronStore(state => state.searchQuery);
  const activeChat = useToronStore(state => state.activeChat);

  // Get actions from store
  const setSearchQuery = useToronStore(state => state.setSearchQuery);
  const setActiveChat = useToronStore(state => state.setActiveChat);
  const createChat = useToronStore(state => state.createChat);
  const deleteChatAction = useToronStore(state => state.deleteChat);
  const updateChat = useToronStore(state => state.updateChat);
  const pinChatAction = useToronStore(state => state.pinChat);
  const unpinChatAction = useToronStore(state => state.unpinChat);
  const duplicateChat = useToronStore(state => state.duplicateChat);
  const getChatGroups = useToronStore(state => state.getChatGroups);

  // Filter chats based on search
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter(chat =>
      chat.title.toLowerCase().includes(query) ||
      chat.preview?.toLowerCase().includes(query) ||
      chat.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
  }, [chats, searchQuery]);

  // Get grouped chats
  const groupedChats = useMemo(() => {
    return getChatGroups();
  }, [getChatGroups, chats, searchQuery]);

  // Rename chat handler
  const renameChat = useCallback((chatId: string, newTitle: string) => {
    updateChat(chatId, { title: newTitle });
  }, [updateChat]);

  // Delete chat handler
  const deleteChat = useCallback((chatId: string) => {
    deleteChatAction(chatId);
  }, [deleteChatAction]);

  // Pin chat handler (toggles)
  const pinChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat?.isPinned) {
      unpinChatAction(chatId);
    } else {
      pinChatAction(chatId);
    }
  }, [chats, pinChatAction, unpinChatAction]);

  return {
    chats: filteredChats,
    groupedChats,
    searchQuery,
    setSearchQuery,
    activeChat,
    setActiveChat,
    createChat,
    deleteChat,
    renameChat,
    pinChat,
    unpinChat: unpinChatAction,
    duplicateChat,
  };
}

export default useChats;
