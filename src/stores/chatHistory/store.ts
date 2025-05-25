import { create, StateCreator } from "zustand";
import { Chat, Folder } from "../../types";
import { createChatOperations } from "./chatOperations";
import { createFolderOperations } from "./folderOperations";
import { createSearchOperations } from "./searchOperations";
import { ChatHistoryState, CachedMessage } from "./types";
import { useCallback, useMemo } from "react";

const validateChatHistory = (chatHistory: unknown): chatHistory is Chat[] => {
  return (
    Array.isArray(chatHistory) &&
    chatHistory.every(
      (chat) =>
        typeof chat === "object" &&
        chat !== null &&
        typeof chat.id === "number" &&
        typeof chat.title === "string"
    )
  );
};

const validateFolders = (folders: unknown): folders is Folder[] => {
  return (
    Array.isArray(folders) &&
    folders.every(
      (folder) =>
        typeof folder === "object" &&
        folder !== null &&
        typeof folder.id === "number" &&
        typeof folder.name === "string"
    )
  );
};

const validateMessages = (messages: unknown): messages is CachedMessage[] => {
  return (
    Array.isArray(messages) &&
    messages.every(
      (message) =>
        typeof message === "object" &&
        message !== null &&
        typeof message.id === "string" &&
        typeof message.text === "string" &&
        (message.sender === "user" || message.sender === "assistant")
    )
  );
};

const createChatHistoryStore: StateCreator<ChatHistoryState> = (set, get) => {
  const baseState = {
    chatHistory: [] as Chat[],
    setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => {
      const newChatHistory =
        typeof chatHistory === "function"
          ? chatHistory(get().chatHistory)
          : chatHistory;

      if (!validateChatHistory(newChatHistory)) {
        console.error("Invalid chat history format:", newChatHistory);
        return;
      }

      set({ chatHistory: newChatHistory });
    },
    folders: [] as Folder[],
    setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => {
      const newFolders =
        typeof folders === "function" ? folders(get().folders) : folders;

      if (!validateFolders(newFolders)) {
        console.error("Invalid folders format:", newFolders);
        return;
      }

      set({ folders: newFolders });
    },
    searchQuery: "",
    setSearchQuery: (value: string | ((prev: string) => string)) => {
      const newValue =
        typeof value === "function" ? value(get().searchQuery) : value;

      if (typeof newValue !== "string") {
        console.error("Invalid search query value:", newValue);
        return;
      }

      set({ searchQuery: newValue });
    },
    showFolders: false,
    setShowFolders: (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue =
        typeof value === "function" ? value(get().showFolders) : value;

      if (typeof newValue !== "boolean") {
        console.error("Invalid show folders value:", newValue);
        return;
      }

      set({ showFolders: newValue });
    },
    chatMessagesCache: {} as Record<number, CachedMessage[]>,
    setChatMessagesCache: (chatId: number, messages: CachedMessage[]) => {
      if (!Number.isInteger(chatId) || chatId <= 0) {
        console.error("Invalid chat ID:", chatId);
        return;
      }

      if (!validateMessages(messages)) {
        console.error("Invalid messages format:", messages);
        return;
      }

      set((state) => ({
        chatMessagesCache: {
          ...state.chatMessagesCache,
          [chatId]: messages,
        },
      }));
    },
    lastSelectedChatId: null as number | null,
    loadingChatId: null as number | null,
    messagesLoaded: {} as Record<number, boolean>,
  };

  const chatOperations = createChatOperations(set, get);

  const folderOperations = createFolderOperations(() => ({
    setChatHistory: get().setChatHistory,
    setFolders: get().setFolders,
  }));

  const searchOperations = createSearchOperations(() => ({
    chatHistory: get().chatHistory,
    searchQuery: get().searchQuery,
    chatMessagesCache: get().chatMessagesCache,
    setChatMessagesCache: get().setChatMessagesCache,
  }));

  return {
    ...baseState,
    ...chatOperations,
    ...folderOperations,
    ...searchOperations,
  };
};

export const useChatHistoryStore = create<ChatHistoryState>(
  createChatHistoryStore
);

export const useChatHistoryStoreOptimized = () => {
  const store = useChatHistoryStore();

  const setChatHistory = useCallback(
    (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => {
      store.setChatHistory(chatHistory);
    },
    [store]
  );

  const setFolders = useCallback(
    (folders: Folder[] | ((prev: Folder[]) => Folder[])) => {
      store.setFolders(folders);
    },
    [store]
  );

  const setSearchQuery = useCallback(
    (value: string | ((prev: string) => string)) => {
      store.setSearchQuery(value);
    },
    [store]
  );

  const setShowFolders = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      store.setShowFolders(value);
    },
    [store]
  );

  const setChatMessagesCache = useCallback(
    (chatId: number, messages: CachedMessage[]) => {
      store.setChatMessagesCache(chatId, messages);
    },
    [store]
  );

  const chatHistory = useMemo(() => store.chatHistory, [store.chatHistory]);
  const folders = useMemo(() => store.folders, [store.folders]);
  const searchQuery = useMemo(() => store.searchQuery, [store.searchQuery]);
  const showFolders = useMemo(() => store.showFolders, [store.showFolders]);
  const chatMessagesCache = useMemo(
    () => store.chatMessagesCache,
    [store.chatMessagesCache]
  );
  const lastSelectedChatId = useMemo(
    () => store.lastSelectedChatId,
    [store.lastSelectedChatId]
  );
  const loadingChatId = useMemo(
    () => store.loadingChatId,
    [store.loadingChatId]
  );
  const messagesLoaded = useMemo(
    () => store.messagesLoaded,
    [store.messagesLoaded]
  );

  return {
    chatHistory,
    setChatHistory,
    folders,
    setFolders,
    searchQuery,
    setSearchQuery,
    showFolders,
    setShowFolders,
    chatMessagesCache,
    setChatMessagesCache,
    lastSelectedChatId,
    loadingChatId,
    messagesLoaded,
    groupChatsByDate: store.groupChatsByDate,
    createNewChat: store.createNewChat,
    selectChat: store.selectChat,
    exportChat: store.exportChat,
    updateLastMessage: store.updateLastMessage,
    addChatToFolder: store.addChatToFolder,
    createFolder: store.createFolder,
    deleteFolder: store.deleteFolder,
    loadChats: store.loadChats,
    loadFolders: store.loadFolders,
    renameChat: store.renameChat,
    deleteChat: store.deleteChat,
    removeChatFromFolder: store.removeChatFromFolder,
  };
};
