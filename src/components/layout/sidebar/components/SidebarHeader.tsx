import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../../../chat/SearchBar";
import Button from "../../../ui/Button";
import { useChatHistoryStore } from "../../../../stores/chatHistory";
import useToast from "../../../../hooks/useToast";

interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isSidebarCollapsed,
  isMobile,
  setIsSidebarCollapsed,
}) => {
  const createNewChat = useChatHistoryStore((state) => state.createNewChat);
  const toast = useToast();

  const handleCreateNewChat = () => {
    try {
      createNewChat();
      toast.success("Новый чат создан");
      if (isMobile) setIsSidebarCollapsed(true);
    } catch {
      toast.error("Не удалось создать новый чат");
    }
  };

  if (isSidebarCollapsed && !isMobile) {
    return (
      <div className="p-4 border-b border-zinc-300 dark:border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="text-zinc-600 hover:text-zinc-900 bg-white dark:bg-[#111827] border border-zinc-300 dark:border-gray-600 hover:bg-zinc-100 dark:hover:bg-gray-700 p-2 rounded-lg w-12"
            aria-label="Развернуть боковую панель"
          >
            <FontAwesomeIcon icon="chevron-right" />
          </button>
          <Button
            onClick={handleCreateNewChat}
            className="p-2 rounded-lg transform transition-transform duration-200 hover:scale-105 shadow-md text-white hover:brightness-90 active:scale-95 transition-all duration-100"
            style={{ backgroundColor: "#f472b6" }}
            aria-label="Новый чат"
          >
            <FontAwesomeIcon icon="plus" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-zinc-300 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <SearchBar />
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="text-zinc-600 hover:text-zinc-900 bg-white dark:bg-[#111827] border border-zinc-300 dark:border-gray-600 hover:bg-zinc-100 dark:hover:bg-gray-600 p-2 rounded-lg"
          aria-label="Свернуть боковую панель"
        >
          <FontAwesomeIcon icon="chevron-left" />
        </button>
      </div>
      <Button
        onClick={handleCreateNewChat}
        className="w-full mt-4 flex items-center justify-center space-x-2 py-2 rounded-lg shadow-md text-white hover:brightness-90 active:scale-95 transition-all duration-100"
        style={{ backgroundColor: "#f472b6" }}
      >
        <span>Новый чат</span>
      </Button>
    </div>
  );
};

export default SidebarHeader;
