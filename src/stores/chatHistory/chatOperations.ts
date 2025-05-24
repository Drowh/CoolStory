import { Chat } from "../../types";
import { useMessageStore } from "../messageStore";
import {
  ModelService,
  setCurrentActiveChatId,
} from "../../services/ModelService";
import { exportChat } from "./utils";
import { useChatHistoryStore } from "./store";
import { CachedMessage } from "./types";

interface ChatOperationsState {
  chatHistory: Chat[];
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  lastSelectedChatId: number | null;
  loadingChatId: number | null;
  messagesLoaded: Record<number, boolean>;
  setChatMessagesCache: (chatId: number, messages: CachedMessage[]) => void;
}

const validateChatId = (chatId: unknown): chatId is number => {
  return typeof chatId === "number" && Number.isInteger(chatId) && chatId > 0;
};

const validateMessage = (message: unknown): message is string => {
  return typeof message === "string" && message.length > 0;
};

const validateTitle = (title: unknown): title is string => {
  return typeof title === "string" && title.length > 0 && title.length <= 100;
};

export const createChatOperations = (getState: () => ChatOperationsState) => {
  const set = (
    newState:
      | Partial<{
          lastSelectedChatId: number | null;
          loadingChatId: number | null;
          messagesLoaded: Record<number, boolean>;
          chatHistory: Chat[];
        }>
      | ((state: {
          lastSelectedChatId: number | null;
          loadingChatId: number | null;
          messagesLoaded: Record<number, boolean>;
        }) => Partial<{
          lastSelectedChatId: number | null;
          loadingChatId: number | null;
          messagesLoaded: Record<number, boolean>;
          chatHistory: Chat[];
        }>)
  ) => {
    const state = useChatHistoryStore.getState();
    useChatHistoryStore.setState(
      typeof newState === "function"
        ? newState(state)
        : { ...state, ...newState }
    );
  };

  const operations = {
    createNewChat: async () => {
      try {
        const user = await (
          await import("../../utils/supabase")
        ).supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("Пользователь не авторизован");
        }

        const newChat: Omit<Chat, "id"> = {
          title: "Новый чат",
          lastMessage: "Начните новый разговор",
          isActive: true,
          hidden: false,
          createdAt: new Date(),
        };

        const { data, error } = await (
          await import("../../utils/supabase")
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
          throw error;
        }

        const { setChatHistory } = getState();
        setChatHistory((prevChats) => [
          {
            ...data,
            folderId: undefined,
            createdAt: new Date(data.created_at),
          },
          ...prevChats.map((chat) => ({
            ...chat,
            isActive: false,
          })),
        ]);

        await operations.selectChat(data.id);
      } catch (error) {
        console.error("Ошибка создания чата:", error);
        throw error;
      }
    },

    selectChat: async (chatId: number) => {
      if (!validateChatId(chatId)) {
        console.error("Невалидный ID чата:", chatId);
        return;
      }

      const { lastSelectedChatId, loadingChatId } = getState();

      if (lastSelectedChatId === chatId || loadingChatId === chatId) {
        return;
      }

      useMessageStore.getState().clearCache();

      set({
        lastSelectedChatId: chatId,
        loadingChatId: chatId,
      });

      setCurrentActiveChatId(chatId);

      try {
        localStorage.setItem("lastActiveChatId", String(chatId));
      } catch (error) {
        console.error("Ошибка сохранения ID активного чата:", error);
      }

      const { chatHistory, setChatHistory } = getState();
      setChatHistory(
        chatHistory.map((chat) => ({
          ...chat,
          isActive: chat.id === chatId,
        }))
      );

      useMessageStore.getState().setMessages([]);

      set(() => ({
        messagesLoaded: {},
      }));

      if (getState().lastSelectedChatId !== chatId) {
        set({ loadingChatId: null });
        setCurrentActiveChatId(null);
        return;
      }

      try {
        const messages = await ModelService.loadMessages(chatId);

        if (getState().lastSelectedChatId !== chatId) {
          set({ loadingChatId: null });
          setCurrentActiveChatId(null);
          return;
        }

        if (messages.length === 0) {
          throw new Error("Не удалось загрузить сообщения");
        }

        set(() => ({
          messagesLoaded: {
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
        useMessageStore.getState().addToCache(chatId, formattedMessages);
      } catch (error) {
        console.error(
          `Ошибка при загрузке сообщений для чата ${chatId}:`,
          error
        );
        set(() => ({
          messagesLoaded: {
            [chatId]: false,
          },
          loadingChatId: null,
        }));
        setCurrentActiveChatId(null);
        throw error;
      }
    },

    updateLastMessage: async (chatId: number, message: string) => {
      if (!validateChatId(chatId)) {
        console.error("Невалидный ID чата:", chatId);
        return;
      }

      if (!validateMessage(message)) {
        console.error("Невалидное сообщение:", message);
        return;
      }

      try {
        const { setChatHistory } = getState();
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

        const { error } = await (await import("../../utils/supabase")).supabase
          .from("chats")
          .update({ last_message: message })
          .eq("id", chatId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Ошибка обновления последнего сообщения:", error);
        throw error;
      }
    },

    exportChat: () => {
      try {
        const { chatHistory } = getState();
        const messages = useMessageStore.getState().messages;
        const activeChat = chatHistory.find((chat) => chat.isActive);

        if (!activeChat) {
          throw new Error("Нет активного чата для экспорта");
        }

        exportChat(activeChat, messages);
      } catch (error) {
        console.error("Ошибка экспорта чата:", error);
        throw error;
      }
    },

    loadChats: async () => {
      try {
        const user = await (
          await import("../../utils/supabase")
        ).supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("Пользователь не авторизован");
        }

        const { data, error } = await (
          await import("../../utils/supabase")
        ).supabase
          .from("chats")
          .select("*")
          .eq("user_id", user.data.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        let activeChatId = null;
        try {
          activeChatId = localStorage.getItem("lastActiveChatId");
          if (activeChatId) activeChatId = parseInt(activeChatId, 10);
        } catch (error) {
          console.error("Ошибка получения ID активного чата:", error);
        }

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
          chatHistory = chatHistory.map((c, i) => ({
            ...c,
            isActive: i === idx,
          }));
        }

        set({ chatHistory });

        const activeChat = chatHistory.find((chat) => chat.isActive);
        if (activeChat) {
          await operations.selectChat(activeChat.id);
        }
      } catch (error) {
        console.error("Ошибка загрузки чатов:", error);
        throw error;
      }
    },

    renameChat: async (chatId: number, newTitle: string) => {
      if (!validateChatId(chatId)) {
        console.error("Невалидный ID чата:", chatId);
        return;
      }

      if (!validateTitle(newTitle)) {
        console.error("Невалидное название чата:", newTitle);
        return;
      }

      try {
        const { setChatHistory } = getState();
        setChatHistory((prevChats) => {
          const updated = prevChats.map((chat) =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          );
          return updated;
        });

        const { error } = await (await import("../../utils/supabase")).supabase
          .from("chats")
          .update({ title: newTitle })
          .eq("id", chatId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Ошибка переименования чата:", error);
        const { setChatHistory } = getState();
        setChatHistory((prevChats) =>
          prevChats.map((chat) =>
            chat.id === chatId ? { ...chat, title: "Новый чат" } : chat
          )
        );
        throw error;
      }
    },

    deleteChat: async (chatId: number) => {
      if (!validateChatId(chatId)) {
        console.error("Невалидный ID чата:", chatId);
        return;
      }

      try {
        const { setChatHistory } = getState();
        setChatHistory((prevChats) =>
          prevChats.filter((chat) => chat.id !== chatId)
        );

        const { error } = await (await import("../../utils/supabase")).supabase
          .from("chats")
          .delete()
          .eq("id", chatId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Ошибка удаления чата:", error);
        throw error;
      }
    },
  };

  return operations;
};
