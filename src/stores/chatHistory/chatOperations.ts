import { Chat } from "../../types";
import { useMessageStore } from "../messageStore";
import { ModelService } from "../../services/ModelService";
import { exportChat } from "./utils";

import { useChatHistoryStore } from "./store";

export const createChatOperations = (
  getState: () => {
    chatHistory: Chat[];
    setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
    lastSelectedChatId: number | null;
    loadingChatId: number | null;
    messagesLoaded: Record<number, boolean>;
    setChatMessagesCache: (
      chatId: number,
      messages: { id: string; text: string; sender: string }[]
    ) => void;
  }
) => {
  const operations = {
    createNewChat: async () => {
      const user = await (
        await import("../../utils/supabase")
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
        console.error("Ошибка создания чата:", error);
        return;
      }

      const { setChatHistory } = getState();
      setChatHistory((prevChats) => [
        { ...data, folderId: undefined, createdAt: new Date(data.created_at) },
        ...prevChats.map((chat) => ({
          ...chat,
          isActive: false,
        })),
      ]);

      operations.selectChat(data.id);
    },

    selectChat: async (chatId: number) => {
      const { lastSelectedChatId, messagesLoaded, loadingChatId } = getState();

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

      const { chatHistory, setChatHistory } = getState();
      setChatHistory(
        chatHistory.map((chat) => ({
          ...chat,
          isActive: chat.id === chatId,
        }))
      );

      useMessageStore.getState().setMessages([]);

      if (messagesLoaded[chatId]) {
      }

      if (getState().lastSelectedChatId !== chatId) {
        set({ loadingChatId: null });
        return;
      }

      try {
        const messages = await ModelService.loadMessages(chatId);

        if (getState().lastSelectedChatId !== chatId) {
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
        console.error(
          `Ошибка при загрузке сообщений для чата ${chatId}:`,
          error
        );
        set({ loadingChatId: null });
      }
    },

    updateLastMessage: async (chatId: number, message: string) => {
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

      if (error)
        console.error("Ошибка обновления последнего сообщения:", error);
    },

    exportChat: () => {
      const { chatHistory } = getState();
      const messages = useMessageStore.getState().messages;
      const activeChat = chatHistory.find((chat) => chat.isActive);
      if (!activeChat) return;
      exportChat(activeChat, messages);
    },

    loadChats: async () => {
      const user = await (
        await import("../../utils/supabase")
      ).supabase.auth.getUser();
      if (!user.data.user) {
        console.error("Пользователь не авторизован");
        return;
      }

      const { data, error } = await (
        await import("../../utils/supabase")
      ).supabase
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
    },

    renameChat: async (chatId: number, newTitle: string) => {
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
        console.error("Ошибка переименования чата:", error);
        setChatHistory((prevChats) =>
          prevChats.map((chat) =>
            chat.id === chatId ? { ...chat, title: "Новый чат" } : chat
          )
        );
      }
    },

    deleteChat: async (chatId: number) => {
      const { setChatHistory } = getState();
      const chatHistory = getState().chatHistory;

      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));

      const { error } = await (await import("../../utils/supabase")).supabase
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
        if (nextChat) operations.selectChat(nextChat.id);
      }
    },
  };

  return operations;
};

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
  const store = useChatHistoryStore.getState();

  if (typeof newState === "function") {
    const stateToUpdate = newState({
      lastSelectedChatId: store.lastSelectedChatId,
      loadingChatId: store.loadingChatId,
      messagesLoaded: store.messagesLoaded,
    });

    if (stateToUpdate.lastSelectedChatId !== undefined)
      store.lastSelectedChatId = stateToUpdate.lastSelectedChatId;
    if (stateToUpdate.loadingChatId !== undefined)
      store.loadingChatId = stateToUpdate.loadingChatId;
    if (stateToUpdate.messagesLoaded)
      store.messagesLoaded = {
        ...store.messagesLoaded,
        ...stateToUpdate.messagesLoaded,
      };
    if (stateToUpdate.chatHistory)
      store.setChatHistory(stateToUpdate.chatHistory);
  } else {
    if (newState.lastSelectedChatId !== undefined)
      store.lastSelectedChatId = newState.lastSelectedChatId;
    if (newState.loadingChatId !== undefined)
      store.loadingChatId = newState.loadingChatId;
    if (newState.messagesLoaded)
      store.messagesLoaded = {
        ...store.messagesLoaded,
        ...newState.messagesLoaded,
      };
    if (newState.chatHistory) store.setChatHistory(newState.chatHistory);
  }
};
