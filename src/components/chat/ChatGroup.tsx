import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chat } from "../../types";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";
import DeleteConfirmButton from "../ui/DeleteConfirmButton";

interface ChatGroupProps {
  title: string;
  chats: Chat[];
}

const ChatGroup: React.FC<ChatGroupProps> = ({ title, chats }) => {
  const { selectChat } = useChatHistoryStore();
  const {
    setOpenMenuId,
    openMenuId,
    setIsRenameDialogOpen,
    setSelectedTabId,
    setIsAddToFolderDialogOpen,
    setSelectedChatId,
    setIsSidebarCollapsed,
  } = useUIStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        openMenuId
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, setOpenMenuId]);

  if (!chats.length) return null;

  const handleChatClick = (chatId: string) => {
    selectChat(parseInt(chatId, 10));
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-xs uppercase text-gray-400 font-semibold px-3 py-2 tracking-wider">
        {title}
      </h3>
      <ul className="space-y-1.5 cursor-pointer">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`group relative rounded-md overflow-visible transition-all duration-200 ${
              chat.isActive
                ? "bg-gradient-to-r from-gray-700 to-gray-800 shadow-md border-l-2 border-pink-500"
                : "hover:bg-gray-700"
            }`}
            onClick={() => handleChatClick(String(chat.id))}
          >
            <div className={`p-3 ${chat.isActive ? "pl-2" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center space-x-2">
                  <div
                    className={`flex flex-row items-center ${
                      chat.isActive ? "text-pink-400" : "text-gray-400"
                    }`}
                  >
                    <p
                      className={`font-medium truncate ${
                        chat.isActive ? "text-gray-100" : "text-gray-200"
                      }`}
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chat.title.length > 30
                        ? chat.title.slice(0, 30) + "..."
                        : chat.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === String(chat.id)
                            ? null
                            : String(chat.id)
                        );
                      }}
                      className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      aria-label="Открыть меню"
                    >
                      <FontAwesomeIcon icon="ellipsis-h" />
                    </button>
                    {openMenuId === String(chat.id) && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1 overflow-hidden"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTabId(String(chat.id));
                            setIsRenameDialogOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          <FontAwesomeIcon
                            icon="edit"
                            className="mr-2 text-gray-400"
                          />
                          Переименовать
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChatId(chat.id);
                            setIsAddToFolderDialogOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          <FontAwesomeIcon
                            icon="folder-plus"
                            className="mr-2 text-gray-400"
                          />
                          Добавить в темку
                        </button>
                        <div className="border-t border-gray-700 my-1"></div>
                        <DeleteConfirmButton
                          itemId={chat.id}
                          itemType="chat"
                          onDelete={() => setOpenMenuId(null)}
                          onCancel={() => setOpenMenuId(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400 truncate mt-1.5 pl-6">
                {chat.lastMessage}
              </p>
            </div>
            {chat.isActive && (
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-600"></div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatGroup;
