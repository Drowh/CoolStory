import { create } from "zustand";
import { Chat } from "../types";
import { initialChats } from "../data/initialData";
import { exportChat } from "../utils/exportUtils";
import { useMessageStore } from "./messageStore";

interface ChatHistoryState {
  chatHistory: Chat[];
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  searchQuery: string;
  setSearchQuery: (value: string | ((prev: string) => string)) => void;
  showFavorites: boolean;
  setShowFavorites: (value: boolean | ((prev: boolean) => boolean)) => void;
  groupChatsByDate: () => {
    today: Chat[];
    yesterday: Chat[];
    lastWeek: Chat[];
    lastMonth: Chat[];
    older: Chat[];
  };
  createNewChat: () => void;
  selectChat: (chatId: number) => void;
  exportChat: () => void;
  updateLastMessage: (chatId: number, message: string) => void;
}

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
  chatHistory: initialChats,
  setChatHistory: (chatHistory) => {
    console.log("setChatHistory вызван, значение:", chatHistory);
    set((state) => {
      const newChatHistory =
        typeof chatHistory === "function" ? chatHistory(state.chatHistory) : chatHistory;
      console.log("Обновляем chatHistory:", newChatHistory);
      return { chatHistory: newChatHistory };
    });
  },
  searchQuery: "",
  setSearchQuery: (value) => {
    console.log("setSearchQuery вызван, значение:", value);
    set((state) => {
      const newSearchQuery =
        typeof value === "function" ? value(state.searchQuery) : value;
      console.log("Обновляем searchQuery:", newSearchQuery);
      return { searchQuery: newSearchQuery };
    });
  },
  showFavorites: false,
  setShowFavorites: (value) => {
    console.log("setShowFavorites вызван, значение:", value);
    set((state) => {
      const newShowFavorites =
        typeof value === "function" ? value(state.showFavorites) : value;
      console.log("Обновляем showFavorites:", newShowFavorites);
      return { showFavorites: newShowFavorites };
    });
  },
  groupChatsByDate: () => {
    const groups = {
      today: [] as Chat[],
      yesterday: [] as Chat[],
      lastWeek: [] as Chat[],
      lastMonth: [] as Chat[],
      older: [] as Chat[],
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    const { chatHistory, searchQuery } = get();

    console.log("groupChatsByDate вызван, chatHistory:", chatHistory, "searchQuery:", searchQuery);

    const filteredChats = chatHistory.filter(
      (chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !chat.hidden
    );

    console.log("filteredChats после фильтрации:", filteredChats);

    filteredChats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups.today.push(chat);
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat);
      } else if (chatDate >= lastWeek) {
        groups.lastWeek.push(chat);
      } else if (chatDate >= lastMonth) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    console.log("Группы после сортировки:", groups);
    return groups;
  },
  createNewChat: () => {
    console.log("createNewChat вызван");
    const { chatHistory, setChatHistory } = get();
    const newChatId = Math.max(...chatHistory.map((chat) => chat.id)) + 1;
    const newChat: Chat = {
      id: newChatId,
      title: `Новый чат ${newChatId}`,
      lastMessage: "Начните новый разговор",
      timestamp: new Date(),
      isActive: true,
      hidden: false,
      isFavorite: false,
    };

    setChatHistory((prevChats) => {
      const updatedChats = prevChats
        .map((chat) => ({
          ...chat,
          isActive: false,
        }))
        .concat(newChat);
      console.log("Обновляем chats в createNewChat:", updatedChats);
      return updatedChats;
    });
    console.log("setChatHistory вызван в createNewChat");

    // Сбрасываем сообщения для нового чата
    useMessageStore.getState().setMessages([]);
  },
  selectChat: (chatId: number) => {
    console.log("selectChat вызван, chatId:", chatId);
    const { chatHistory, setChatHistory } = get();
    setChatHistory(
      chatHistory.map((chat) => ({
        ...chat,
        isActive: chat.id === chatId,
        timestamp: chat.id === chatId ? new Date() : chat.timestamp,
      }))
    );

    // Загружаем сообщения выбранного чата (пока заглушка)
    useMessageStore.getState().setMessages([
      {
        id: 1,
        text: "Чат загружен",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
  },
  updateLastMessage: (chatId: number, message: string) => {
    console.log("updateLastMessage вызван, chatId:", chatId, "message:", message);
    const { setChatHistory } = get();
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              timestamp: new Date(),
            }
          : chat
      )
    );
  },
  exportChat: () => {
    console.log("exportChat вызван");
    const { chatHistory } = get();
    const messages = useMessageStore.getState().messages;
    const activeChat = chatHistory.find((chat) => chat.isActive);
    if (!activeChat) {
      console.error("Активный чат не найден");
      return;
    }
    console.log("activeChat:", activeChat, "messages:", messages);
    exportChat(activeChat, messages);
    console.log("exportChat выполнен");
  },
}));