import { create } from "zustand";
import { Chat, Folder } from "../../types";
import { createChatOperations } from "./chatOperations";
import { createFolderOperations } from "./folderOperations";
import { createSearchOperations } from "./searchOperations";
import { ChatHistoryState } from "./types";

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => {
  const baseState = {
    chatHistory: [] as Chat[],
    setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => {
      set({
        chatHistory:
          typeof chatHistory === "function"
            ? chatHistory(get().chatHistory)
            : chatHistory,
      });
    },
    folders: [] as Folder[],
    setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => {
      set({
        folders:
          typeof folders === "function" ? folders(get().folders) : folders,
      });
    },
    searchQuery: "",
    setSearchQuery: (value: string | ((prev: string) => string)) => {
      set({
        searchQuery:
          typeof value === "function" ? value(get().searchQuery) : value,
      });
    },
    showFolders: false,
    setShowFolders: (value: boolean | ((prev: boolean) => boolean)) => {
      set({
        showFolders:
          typeof value === "function" ? value(get().showFolders) : value,
      });
    },
    chatMessagesCache: {} as Record<
      number,
      { id: string; text: string; sender: string }[]
    >,
    setChatMessagesCache: (
      chatId: number,
      messages: { id: string; text: string; sender: string }[]
    ) => {
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

  const chatOperations = createChatOperations(() => ({
    chatHistory: get().chatHistory,
    setChatHistory: get().setChatHistory,
    lastSelectedChatId: get().lastSelectedChatId,
    loadingChatId: get().loadingChatId,
    messagesLoaded: get().messagesLoaded,
    setChatMessagesCache: get().setChatMessagesCache,
  }));

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
});
