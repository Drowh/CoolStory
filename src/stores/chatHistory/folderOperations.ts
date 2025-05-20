import { Chat, Folder } from "../../types";

export const createFolderOperations = (
  getState: () => {
    setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
    setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
  }
) => {
  return {
    addChatToFolder: async (chatId: number, folderId: number) => {
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

      if (error) console.error("Ошибка добавления чата в папку:", error);
    },

    createFolder: async (name: string) => {
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
        .from("folders")
        .insert({ name, user_id: user.data.user.id })
        .select()
        .single();

      if (error) {
        console.error("Ошибка создания папки:", error);
        return;
      }

      const { setFolders } = getState();
      setFolders((prev) => [...prev, { id: data.id, name: data.name }]);
    },

    deleteFolder: async (folderId: number) => {
      const { setFolders, setChatHistory } = getState();
      const { error: folderError } = await (
        await import("../../utils/supabase")
      ).supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (folderError) {
        console.error("Ошибка удаления папки:", folderError);
        return;
      }

      const { error: chatError } = await (
        await import("../../utils/supabase")
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

    loadFolders: async () => {
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
        .from("folders")
        .select("*")
        .eq("user_id", user.data.user.id);

      if (error) {
        console.error("Ошибка загрузки папок:", error);
        return;
      }

      const { setFolders } = getState();
      setFolders(
        data.map((folder) => ({
          id: folder.id,
          name: folder.name,
        }))
      );
    },

    removeChatFromFolder: async (chatId: number) => {
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
  };
};
