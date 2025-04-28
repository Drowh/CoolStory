import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chat } from "../../types";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";

interface ChatGroupProps {
  title: string;
  chats: Chat[];
}

const ChatGroup: React.FC<ChatGroupProps> = ({ title, chats }) => {
  const setChatHistory = useChatHistoryStore((state) => state.setChatHistory);
  const selectChat = useChatHistoryStore((state) => state.selectChat);
  const setOpenMenuId = useUIStore((state) => state.setOpenMenuId);
  const openMenuId = useUIStore((state) => state.openMenuId);
  const setIsRenameDialogOpen = useUIStore(
    (state) => state.setIsRenameDialogOpen
  );
  const setSelectedTabId = useUIStore((state) => state.setSelectedTabId);

  if (!chats.length) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs uppercase text-gray-500 font-semibold px-3 py-2">
        {title}
      </h3>
      <ul className="space-y-1">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`group flex flex-col p-3 rounded-md cursor-pointer transition-colors duration-200 ${
              chat.isActive ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => selectChat(chat.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center space-x-2">
                <p className="text-gray-100 font-medium truncate">
                  {chat.title}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatHistory((prev) =>
                      prev.map((c) =>
                        c.id === chat.id
                          ? { ...c, isFavorite: !c.isFavorite }
                          : c
                      )
                    );
                  }}
                  className={`text-gray-400 hover:text-yellow-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 ${
                    chat.isFavorite ? "text-yellow-500 opacity-100" : ""
                  }`}
                >
                  <FontAwesomeIcon icon="star" />
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                    }}
                    className="text-gray-400 hover:text-gray-200 p-1 rounded-full hover:bg-gray-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <FontAwesomeIcon icon="ellipsis-h" />
                  </button>
                  {openMenuId === chat.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTabId(chat.id);
                          setIsRenameDialogOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Переименовать
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatHistory((prev) =>
                            prev.filter((c) => c.id !== chat.id)
                          );
                          setOpenMenuId(null);
                          if (chat.isActive && chats.length > 1) {
                            const nextChat = chats.find(
                              (c) => c.id !== chat.id
                            );
                            if (nextChat) selectChat(nextChat.id);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-base text-gray-400 truncate mt-1">
              {chat.lastMessage}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatGroup;
