import { useEffect, useCallback } from "react";
import { useChatHistoryStore } from "./store";

export { useChatHistoryStore } from "./store";

export const useChatHistory = () => {
  const loadChats = useChatHistoryStore((state) => state.loadChats);
  const loadFolders = useChatHistoryStore((state) => state.loadFolders);

  const initializeData = useCallback(async () => {
    try {
      await Promise.all([loadChats(), loadFolders()]);
    } catch (error) {
      console.error("Ошибка при загрузке данных истории чатов:", error);
    }
  }, [loadChats, loadFolders]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    loadChats,
    loadFolders,
    initializeData,
  };
};
