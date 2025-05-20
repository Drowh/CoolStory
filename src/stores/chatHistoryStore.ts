import { create } from "zustand";
import { Chat, Folder } from "../types";
import { exportChat } from "../utils/exportUtils";
import { useMessageStore } from "./messageStore";
import { useEffect } from "react";
import { ModelService } from "../services/ModelService";

interface ChatHistoryState {
  chatHistory: Chat[];
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  folders: Folder[];
  setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
  searchQuery: string;
  setSearchQuery: (value: string | ((prev: string) => string)) => void;
  showFolders: boolean;
  setShowFolders: (value: boolean | ((prev: boolean) => boolean)) => void;
  groupChatsByDate: () => Promise<{
    today: { chat: Chat; matchedSnippet?: string }[];
    older: { chat: Chat; matchedSnippet?: string }[];
  }>;
  createNewChat: () => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  exportChat: () => void;
  updateLastMessage: (chatId: number, message: string) => Promise<void>;
  addChatToFolder: (chatId: number, folderId: number) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (folderId: number) => Promise<void>;
  loadChats: () => Promise<void>;
  loadFolders: () => Promise<void>;
  renameChat: (chatId: number, newTitle: string) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  removeChatFromFolder: (chatId: number) => Promise<void>;
  lastSelectedChatId: number | null;
  loadingChatId: number | null;
  messagesLoaded: Record<number, boolean>;
  chatMessagesCache: Record<
    number,
    { id: string; text: string; sender: string }[]
  >;
  setChatMessagesCache: (
    chatId: number,
    messages: { id: string; text: string; sender: string }[]
  ) => void;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
  chatHistory: [],
  setChatHistory: (chatHistory) => {
    set({
      chatHistory:
        typeof chatHistory === "function"
          ? chatHistory(get().chatHistory)
          : chatHistory,
    });
  },
  folders: [],
  setFolders: (folders) => {
    set({
      folders: typeof folders === "function" ? folders(get().folders) : folders,
    });
  },
  searchQuery: "",
  setSearchQuery: (value) => {
    set({
      searchQuery:
        typeof value === "function" ? value(get().searchQuery) : value,
    });
  },
  showFolders: false,
  setShowFolders: (value) => {
    set({
      showFolders:
        typeof value === "function" ? value(get().showFolders) : value,
    });
  },
  chatMessagesCache: {},
  setChatMessagesCache: (chatId, messages) => {
    set((state) => ({
      chatMessagesCache: {
        ...state.chatMessagesCache,
        [chatId]: messages,
      },
    }));
  },
  groupChatsByDate: async () => {
    const groups = {
      today: [] as { chat: Chat; matchedSnippet?: string }[],
      older: [] as { chat: Chat; matchedSnippet?: string }[],
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const {
      chatHistory,
      searchQuery,
      chatMessagesCache,
      setChatMessagesCache,
    } = get();

    const query = searchQuery.trim().toLowerCase();
    let filteredChats: {
      chat: Chat;
      score: number;
      matchedSnippet?: string;
    }[] = chatHistory
      .filter((chat) => !chat.hidden)
      .map((chat) => ({ chat, score: 0, matchedSnippet: undefined }));

    if (query) {
      const titleMatches: {
        chat: Chat;
        score: number;
        matchedSnippet?: string;
      }[] = [];
      const contentMatches: {
        chat: Chat;
        score: number;
        matchedSnippet?: string;
      }[] = [];

      for (const chatEntry of filteredChats) {
        const chat = chatEntry.chat;
        let score = 0;
        let matchedSnippet: string | undefined = undefined;

        const titleMatch = chat.title.toLowerCase().includes(query);
        if (titleMatch) {
          score += 100;
          const queryIndex = chat.title.toLowerCase().indexOf(query);
          if (queryIndex < 10) score += 20;
          titleMatches.push({ chat, score, matchedSnippet });
          continue;
        }

        if (!chatMessagesCache[chat.id]) {
          try {
            const messages = await ModelService.loadMessages(chat.id);
            const formattedMessages = messages.map((msg, index) => ({
              id: `${chat.id}-${msg.id || index}`,
              text: msg.content || "",
              sender: msg.role as "user" | "assistant",
            }));
            setChatMessagesCache(chat.id, formattedMessages);
            
          } catch (error) {
            console.error(`Error loading messages for chat ${chat.id}:`, error);
            continue;
          }
        }

        const messages = chatMessagesCache[chat.id] || [];
        if (messages.length > 0) {
          for (const msg of messages) {
            const text = msg.text.toLowerCase();
            if (text.includes(query)) {
              score += 50;
              const queryIndex = text.indexOf(query);
              if (queryIndex < 50) score += 20;
              const start = Math.max(0, queryIndex - 30);
              const end = Math.min(text.length, queryIndex + query.length + 30);
              matchedSnippet = text
                .slice(start, end)
                .replace(new RegExp(`(${query})`, "gi"), `<mark>$1</mark>`);
              contentMatches.push({ chat, score, matchedSnippet });
              break;
            } else {
              const words = text.split(/\s+/);
              for (const word of words) {
                const distance = levenshteinDistance(query, word);
                if (distance <= 2 && word.length >= query.length - 1) {
                  score += 30;
                  const start = Math.max(0, text.indexOf(word) - 20);
                  const end = Math.min(
                    text.length,
                    text.indexOf(word) + word.length + 20
                  );
                  matchedSnippet = `${text.slice(
                    start,
                    text.indexOf(word)
                  )}${word}${text.slice(
                    text.indexOf(word) + word.length,
                    end
                  )}`;
                  
                  break;
                }
              }
              if (matchedSnippet) break;
            }
          }
          if (score > 0) {
            contentMatches.push({ chat, score, matchedSnippet });
          }
        }
      }

      titleMatches.sort((a, b) => b.score - a.score);
      contentMatches.sort((a, b) => b.score - a.score);

      filteredChats = [...titleMatches, ...contentMatches];
    }

    filteredChats.forEach(({ chat, matchedSnippet }) => {
      const chatDate = chat.createdAt ? new Date(chat.createdAt) : new Date();
      if (chatDate >= today) {
        groups.today.push({ chat, matchedSnippet });
      } else {
        groups.older.push({ chat, matchedSnippet });
      }
    });

    return groups;
  },
  createNewChat: async () => {
    const user = await (
      await import("../utils/supabase")
    ).supabase.auth.getUser();
    if (!user.data.user) {
      console.error("Пользователь не авторизован");
      return;
    }

    const newChat: Omit<Chat, "id"> = {
      title: "Новый чат",
      lastMessage: "Начните новый разговор",
      isActive: true,
      hidden: false,
      createdAt: new Date(),
    };

    const { data, error } = await (
      await import("../utils/supabase")
    ).supabase
      .from("chats")
      .insert({
        title: newChat.title,
        last_message: newChat.lastMessage,
        is_active: newChat.isActive,
        hidden: newChat.hidden,
        user_id: user.data.user.id,
        created_at: newChat.createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Ошибка создания чата:", error);
      return;
    }

    const { setChatHistory, selectChat } = get();
    setChatHistory((prevChats) => [
      { ...data, folderId: undefined, createdAt: new Date(data.created_at) },
      ...prevChats.map((chat) => ({
        ...chat,
        isActive: false,
      })),
    ]);

    selectChat(data.id);
  },
  selectChat: async (chatId: number) => {
    const { lastSelectedChatId, messagesLoaded, loadingChatId } = get();

    if (lastSelectedChatId === chatId) {
      return;
    }

    if (loadingChatId === chatId) {
      return;
    }

    set({
      lastSelectedChatId: chatId,
      loadingChatId: chatId,
    });

    try {
      localStorage.setItem("lastActiveChatId", String(chatId));
    } catch {}

    const { chatHistory, setChatHistory } = get();
    setChatHistory(
      chatHistory.map((chat) => ({
        ...chat,
        isActive: chat.id === chatId,
      }))
    );

    useMessageStore.getState().setMessages([]);

    if (messagesLoaded[chatId]) {
    }

    if (get().lastSelectedChatId !== chatId) {
      set({ loadingChatId: null });
      return;
    }

    try {
      const messages = await ModelService.loadMessages(chatId);

      if (get().lastSelectedChatId !== chatId) {
        set({ loadingChatId: null });
        return;
      }

      set((state) => ({
        messagesLoaded: {
          ...state.messagesLoaded,
          [chatId]: true,
        },
        loadingChatId: null,
      }));

      const formattedMessages = messages.map((msg, index) => ({
        id: `${chatId}-${msg.id || index}`,
        text: msg.content,
        sender: msg.role as "user" | "assistant",
      }));

      useMessageStore.getState().setMessages(formattedMessages);
    } catch (error) {
      console.error(`Ошибка при загрузке сообщений для чата ${chatId}:`, error);
      set({ loadingChatId: null });
    }
  },
  updateLastMessage: async (chatId: number, message: string) => {
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

    const { error } = await (await import("../utils/supabase")).supabase
      .from("chats")
      .update({ last_message: message })
      .eq("id", chatId);

    if (error) console.error("Ошибка обновления последнего сообщения:", error);
  },
  exportChat: () => {
    const { chatHistory } = get();
    const messages = useMessageStore.getState().messages;
    const activeChat = chatHistory.find((chat) => chat.isActive);
    if (!activeChat) return;
    exportChat(activeChat, messages);
  },
  addChatToFolder: async (chatId: number, folderId: number) => {
    const { setChatHistory } = get();
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, folderId } : chat
      )
    );

    const { error } = await (await import("../utils/supabase")).supabase
      .from("chats")
      .update({ folder_id: folderId })
      .eq("id", chatId);

    if (error) console.error("Ошибка добавления чата в папку:", error);
  },
  createFolder: async (name: string) => {
    const user = await (
      await import("../utils/supabase")
    ).supabase.auth.getUser();
    if (!user.data.user) {
      console.error("Пользователь не авторизован");
      return;
    }

    const { data, error } = await (await import("../utils/supabase")).supabase
      .from("folders")
      .insert({ name, user_id: user.data.user.id })
      .select()
      .single();

    if (error) {
      console.error("Ошибка создания папки:", error);
      return;
    }

    const { setFolders } = get();
    setFolders((prev) => [...prev, { id: data.id, name: data.name }]);
  },
  deleteFolder: async (folderId: number) => {
    const { setFolders, setChatHistory } = get();
    const { error: folderError } = await (
      await import("../utils/supabase")
    ).supabase
      .from("folders")
      .delete()
      .eq("id", folderId);

    if (folderError) {
      console.error("Ошибка удаления папки:", folderError);
      return;
    }

    const { error: chatError } = await (
      await import("../utils/supabase")
    ).supabase
      .from("chats")
      .update({ folder_id: null })
      .eq("folder_id", folderId);

    if (chatError) {
      console.error("Ошибка обновления чатов при удалении папки:", chatError);
      return;
    }

    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === folderId ? { ...chat, folderId: undefined } : chat
      )
    );
  },
  loadChats: async () => {
    const user = await (
      await import("../utils/supabase")
    ).supabase.auth.getUser();
    if (!user.data.user) {
      console.error("Пользователь не авторизован");
      return;
    }

    const { data, error } = await (await import("../utils/supabase")).supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ошибка загрузки чатов:", error);
      return;
    }

    let activeChatId = null;
    try {
      activeChatId = localStorage.getItem("lastActiveChatId");
      if (activeChatId) activeChatId = parseInt(activeChatId, 10);
    } catch {}

    let chatHistory = data.map((chat) => ({
      id: chat.id,
      title: chat.title,
      lastMessage: chat.last_message,
      isActive: false,
      hidden: chat.hidden,
      folderId: chat.folder_id,
      createdAt: new Date(chat.created_at),
    }));
    if (chatHistory.length > 0) {
      let idx = 0;
      if (activeChatId) {
        idx = chatHistory.findIndex((c) => c.id === activeChatId);
        if (idx === -1) idx = 0;
      }
      chatHistory = chatHistory.map((c, i) => ({ ...c, isActive: i === idx }));
    }
    set({ chatHistory });

    const activeChat = chatHistory.find((chat) => chat.isActive);
    if (activeChat) {
      await get().selectChat(activeChat.id);
    }
  },
  loadFolders: async () => {
    const user = await (
      await import("../utils/supabase")
    ).supabase.auth.getUser();
    if (!user.data.user) {
      console.error("Пользователь не авторизован");
      return;
    }

    const { data, error } = await (await import("../utils/supabase")).supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.data.user.id);

    if (error) {
      console.error("Ошибка загрузки папок:", error);
      return;
    }

    set({
      folders: data.map((folder) => ({
        id: folder.id,
        name: folder.name,
      })),
    });
  },
  renameChat: async (chatId: number, newTitle: string) => {
    const { setChatHistory } = get();
    setChatHistory((prevChats) => {
      const updated = prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      );
      return updated;
    });

    const { error } = await (await import("../utils/supabase")).supabase
      .from("chats")
      .update({ title: newTitle })
      .eq("id", chatId);

    if (error) {
      console.error("Ошибка переименования чата:", error);
      setChatHistory((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, title: "Новый чат" } : chat
        )
      );
    }
  },
  deleteChat: async (chatId: number) => {
    const { setChatHistory, selectChat } = get();
    const chatHistory = get().chatHistory;

    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));

    const { error } = await (await import("../utils/supabase")).supabase
      .from("chats")
      .delete()
      .eq("id", chatId);

    if (error) {
      console.error("Ошибка удаления чата:", error);
      setChatHistory([...chatHistory]);
      return;
    }

    const deletedChat = chatHistory.find((chat) => chat.id === chatId);
    if (deletedChat?.isActive && chatHistory.length > 1) {
      const nextChat = chatHistory.find((chat) => chat.id !== chatId);
      if (nextChat) selectChat(nextChat.id);
    }
  },
  removeChatFromFolder: async (chatId: number) => {
    const { setChatHistory } = get();
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, folderId: undefined } : chat
      )
    );

    const { error } = await (await import("../utils/supabase")).supabase
      .from("chats")
      .update({ folder_id: null })
      .eq("id", chatId);

    if (error) {
      console.error("Ошибка удаления чата из папки:", error);
      setChatHistory((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                folderId: prevChats.find((c) => c.id === chatId)?.folderId,
              }
            : chat
        )
      );
    }
  },
  lastSelectedChatId: null,
  loadingChatId: null,
  messagesLoaded: {},
}));

export const useChatHistory = () => {
  const loadChats = useChatHistoryStore((state) => state.loadChats);
  const loadFolders = useChatHistoryStore((state) => state.loadFolders);

  useEffect(() => {
    loadChats();
    loadFolders();
  }, [loadChats, loadFolders]);
};
