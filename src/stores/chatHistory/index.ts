import { useEffect } from "react";
import { useChatHistoryStore } from "./store";
export { useChatHistoryStore } from "./store";

export const useChatHistory = () => {
  const loadChats = useChatHistoryStore((state) => state.loadChats);
  const loadFolders = useChatHistoryStore((state) => state.loadFolders);

  useEffect(() => {
    loadChats();
    loadFolders();
  }, [loadChats, loadFolders]);
};
