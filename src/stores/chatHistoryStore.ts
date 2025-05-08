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
  groupChatsByDate: () => {
    today: Chat[];
    older: Chat[];
  };
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
      const chatDate = chat.createdAt ? new Date(chat.createdAt) : new Date();
      if (chatDate >= today) {
        groups.today.push(chat);
      } else {
        groups.older.push(chat);
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
    const { chatHistory, setChatHistory } = get();
    setChatHistory(
      chatHistory.map((chat) => ({
        ...chat,
        isActive: chat.id === chatId,
      }))
    );

    const messages = await ModelService.loadMessages(chatId);

    useMessageStore.getState().setMessages(
      messages.map((msg, index) => ({
        id: Date.now() + index,
        text: msg.content,
        sender: msg.role as "user" | "assistant",
      }))
    );
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
        chat.folderId === folderId ? { ...chat, folderId: undefined } : chat
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

    set({
      chatHistory: data.map((chat) => ({
        id: chat.id,
        title: chat.title,
        lastMessage: chat.last_message,
        isActive: chat.is_active,
        hidden: chat.hidden,
        folderId: chat.folder_id,
        createdAt: new Date(chat.created_at),
      })),
    });
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
    setChatHistory((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );

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
}));

export const useChatHistory = () => {
  const loadChats = useChatHistoryStore((state) => state.loadChats);
  const loadFolders = useChatHistoryStore((state) => state.loadFolders);

  useEffect(() => {
    loadChats();
    loadFolders();
  }, [loadChats, loadFolders]);
};
