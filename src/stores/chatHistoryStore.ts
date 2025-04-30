import { create } from "zustand";
import { Chat, Folder } from "../types";
import { initialChats } from "../data/initialData";
import { exportChat } from "../utils/exportUtils";
import { useMessageStore } from "./messageStore";

interface ChatHistoryState {
  chatHistory: Chat[];
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  folders: Folder[];
  setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
  searchQuery: string;
  setSearchQuery: (value: string | ((prev: string) => string)) => void;
  showFolders: boolean;
  setShowFolders: (value: boolean | ((prev: boolean) => boolean)) => void;
  groupChatsByDate: () => {
    today: Chat[];
    older: Chat[];
  };
  createNewChat: () => void;
  selectChat: (chatId: number) => void;
  exportChat: () => void;
  updateLastMessage: (chatId: number, message: string) => void;
  addChatToFolder: (chatId: number, folderId: number) => void;
  createFolder: (name: string) => void;
  deleteFolder: (folderId: number) => void;
}

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
  chatHistory: initialChats,
  setChatHistory: (chatHistory) => {
    set((state) => ({
      chatHistory:
        typeof chatHistory === "function"
          ? chatHistory(state.chatHistory)
          : chatHistory,
    }));
  },
  folders: [],
  setFolders: (folders) => {
    set((state) => ({
      folders: typeof folders === "function" ? folders(state.folders) : folders,
    }));
  },
  searchQuery: "",
  setSearchQuery: (value) => {
    set((state) => ({
      searchQuery:
        typeof value === "function" ? value(state.searchQuery) : value,
    }));
  },
  showFolders: false,
  setShowFolders: (value) => {
    set((state) => ({
      showFolders:
        typeof value === "function" ? value(state.showFolders) : value,
    }));
  },
  groupChatsByDate: () => {
    const groups = {
      today: [] as Chat[],
      older: [] as Chat[],
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const { chatHistory, searchQuery } = get();

    const filteredChats = chatHistory.filter(
      (chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !chat.hidden
    );

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.id);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  },
  createNewChat: () => {
    const { chatHistory, setChatHistory } = get();
    const newChatId = Math.max(...chatHistory.map((chat) => chat.id), 0) + 1;
    const newChat: Chat = {
      id: newChatId,
      title: `Новый чат ${newChatId}`,
      lastMessage: "Начните новый разговор",
      isActive: true,
      hidden: false,
    };

    setChatHistory((prevChats) => [
      newChat,
      ...prevChats.map((chat) => ({
        ...chat,
        isActive: false,
      })),
    ]);

    useMessageStore.getState().setMessages([]);
  },
  selectChat: (chatId: number) => {
    const { chatHistory, setChatHistory } = get();
    setChatHistory(
      chatHistory.map((chat) => ({
        ...chat,
        isActive: chat.id === chatId,
      }))
    );

    useMessageStore.getState().setMessages([
      {
        id: 1,
        text: "Чат загружен",
        sender: "assistant",
      },
    ]);
  },
  updateLastMessage: (chatId: number, message: string) => {
    const { setChatHistory } = get();
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
            }
          : chat
      )
    );
  },
  exportChat: () => {
    const { chatHistory } = get();
    const messages = useMessageStore.getState().messages;
    const activeChat = chatHistory.find((chat) => chat.isActive);
    if (!activeChat) return;
    exportChat(activeChat, messages);
  },
  addChatToFolder: (chatId: number, folderId: number) => {
    const { setChatHistory } = get();
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, folderId } : chat
      )
    );
  },
  createFolder: (name: string) => {
    const { setFolders } = get();
    setFolders((prev) => {
      const newFolderId = Math.max(...prev.map((f) => f.id), 0) + 1;
      const newFolder: Folder = { id: newFolderId, name };
      return [...prev, newFolder];
    });
  },
  deleteFolder: (folderId: number) => {
    const { folders, setFolders, setChatHistory } = get();
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.folderId === folderId ? { ...chat, folderId: undefined } : chat
      )
    );
  },
}));
