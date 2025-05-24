import { Chat, Folder } from "../../types";

interface FolderOperationsState {
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
}

const validateFolderId = (folderId: unknown): folderId is number => {
  return (
    typeof folderId === "number" && Number.isInteger(folderId) && folderId > 0
  );
};

const validateChatId = (chatId: unknown): chatId is number => {
  return typeof chatId === "number" && Number.isInteger(chatId) && chatId > 0;
};

const validateFolderName = (name: unknown): name is string => {
  return typeof name === "string" && name.length > 0 && name.length <= 50;
};

export const createFolderOperations = (
  getState: () => FolderOperationsState
) => {
  return {
    addChatToFolder: async (chatId: number, folderId: number) => {
      if (!validateChatId(chatId)) {
        console.error("Невалидный ID чата:", chatId);
        return;
      }

      if (!validateFolderId(folderId)) {
        console.error("Невалидный ID папки:", folderId);
        return;
      }

      try {
        const { setChatHistory } = getState();
        setChatHistory((prevChats) =>
          prevChats.map((chat) =>
            chat.id === chatId ? { ...chat, folderId } : chat
          )
        );

        const { error } = await (await import("../../utils/supabase")).supabase
          .from("chats")
          .update({ folder_id: folderId })
          .eq("id", chatId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Ошибка добавления чата в папку:", error);
        const { setChatHistory } = getState();
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
        throw error;
      }
    },

    createFolder: async (name: string) => {
      if (!validateFolderName(name)) {
        console.error("Невалидное название папки:", name);
        return;
      }

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
          .from("folders")
          .insert({ name, user_id: user.data.user.id })
          .select()
          .single();

        if (error) {
          throw error;
        }

        const { setFolders } = getState();
        setFolders((prev) => [...prev, { id: data.id, name: data.name }]);
      } catch (error) {
        console.error("Ошибка создания папки:", error);
        throw error;
      }
    },

    deleteFolder: async (folderId: number) => {
      if (!validateFolderId(folderId)) {
        console.error("Невалидный ID папки:", folderId);
        return;
      }

      try {
        const { setFolders, setChatHistory } = getState();
        const { error: folderError } = await (
          await import("../../utils/supabase")
        ).supabase
          .from("folders")
          .delete()
          .eq("id", folderId);

        if (folderError) {
          throw folderError;
        }

        const { error: chatError } = await (
          await import("../../utils/supabase")
        ).supabase
          .from("chats")
          .update({ folder_id: null })
          .eq("folder_id", folderId);

        if (chatError) {
          throw chatError;
        }

        setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
        setChatHistory((prevChats) =>
          prevChats.map((chat) =>
            chat.folderId === folderId ? { ...chat, folderId: undefined } : chat
          )
        );
      } catch (error) {
        console.error("Ошибка удаления папки:", error);
        throw error;
      }
    },

    loadFolders: async () => {
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
          .from("folders")
          .select("*")
          .eq("user_id", user.data.user.id);

        if (error) {
          throw error;
        }

        const { setFolders } = getState();
        setFolders(
          data.map((folder) => ({
            id: folder.id,
            name: folder.name,
          }))
        );
      } catch (error) {
        console.error("Ошибка загрузки папок:", error);
        throw error;
      }
    },

    removeChatFromFolder: async (chatId: number) => {
      if (!validateChatId(chatId)) {
        console.error("Невалидный ID чата:", chatId);
        return;
      }

      try {
        const { setChatHistory } = getState();
        setChatHistory((prevChats) =>
          prevChats.map((chat) =>
            chat.id === chatId ? { ...chat, folderId: undefined } : chat
          )
        );

        const { error } = await (await import("../../utils/supabase")).supabase
          .from("chats")
          .update({ folder_id: null })
          .eq("id", chatId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Ошибка удаления чата из папки:", error);
        const { setChatHistory } = getState();
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
        throw error;
      }
    },
  };
};
