import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SearchBar from "../../../chat/SearchBar";
import Button from "../../../ui/Button";
import { useChatHistoryStore } from "../../../../stores/chatHistory";

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

  const handleCreateNewChat = () => {
    createNewChat();
    if (isMobile) setIsSidebarCollapsed(true);
  };

  if (isSidebarCollapsed && !isMobile) {
    return (
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="text-gray-400 hover:text-gray-200 bg-[#111827] border border-gray-600 hover:bg-gray-700 p-2 rounded-lg w-12"
            aria-label="Развернуть боковую панель"
          >
            <FontAwesomeIcon icon="chevron-right" />
          </button>
          <Button
            onClick={handleCreateNewChat}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 p-2 rounded-lg transform transition-transform duration-200 hover:scale-105 shadow-md"
            aria-label="Новый чат"
          >
            <FontAwesomeIcon icon="plus" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between gap-2">
        <SearchBar />
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="text-gray-400 px-4 hover:text-gray-200 bg-[#111827] border border-gray-600 hover:bg-gray-600 p-2 rounded-lg"
          aria-label="Свернуть боковую панель"
        >
          <FontAwesomeIcon icon="chevron-left" />
        </button>
      </div>
      <Button
        onClick={handleCreateNewChat}
        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 w-full mt-4 flex items-center justify-center space-x-2 py-2 rounded-lg shadow-md"
      >
        <span>Новый чат</span>
      </Button>
    </div>
  );
};

export default SidebarHeader;
