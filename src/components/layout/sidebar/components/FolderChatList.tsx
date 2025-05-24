import React from "react";
import ChatItemMenu from "../../../chat/chat-group/components/ChatItemMenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chat } from "../../../../types";

interface FolderChatListProps {
  folderId: number;
  folderName: string;
  chats: Chat[];
  isExpanded: boolean;
  isMobile: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  handleChatClick: (chatId: number) => void;
  menuRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
}

const FolderChatList: React.FC<FolderChatListProps> = ({
  folderId,
  folderName,
  chats,
  isExpanded,
  isMobile,
  openMenuId,
  setOpenMenuId,
  setIsSidebarCollapsed,
  handleChatClick,
  menuRefs,
}) => {
  if (!isExpanded || chats.length === 0) return null;

  return (
    <ul
      id={`folder-chats-${folderId}`}
      className="pl-6 space-y-1 border-l border-zinc-200 dark:border-gray-700"
      role="listbox"
      aria-label={`Чаты в темке ${folderName}`}
    >
      {chats.map((chat) => {
        const menuKey = `${chat.id}:folder-${folderId}`;
        return (
          <li
            key={chat.id}
            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer ${
              chat.isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-gray-700 dark:text-gray-100 border-l-2 border-pink-500"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
            onClick={() => handleChatClick(chat.id)}
            role="option"
            aria-selected={chat.isActive}
            aria-label={`Чат: ${chat.title}`}
            tabIndex={0}
          >
            <span className="flex-1 truncate">{chat.title}</span>
            <div
              className="relative"
              ref={(el) => {
                if (menuRefs.current) menuRefs.current[menuKey] = el;
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === menuKey ? null : menuKey);
                }}
                className={`text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200 ml-1 rounded-full hover:bg-zinc-100 dark:hover:bg-gray-700 transition-all duration-200 opacity-100 sm:opacity-0 group-hover:opacity-100`}
                aria-label="Открыть меню действий для чата"
                aria-haspopup="true"
                aria-expanded={openMenuId === menuKey}
              >
                <FontAwesomeIcon icon="ellipsis-h" aria-hidden="true" />
              </button>
              {openMenuId === menuKey && (
                <ChatItemMenu
                  chatId={chat.id}
                  menuRef={{ current: menuRefs.current[menuKey] }}
                  isMobile={isMobile}
                  setIsSidebarCollapsed={setIsSidebarCollapsed}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default FolderChatList;
