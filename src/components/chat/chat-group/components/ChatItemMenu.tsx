import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUIStore } from "../../../../stores/uiStore";
import DeleteConfirmButton from "../../../ui/DeleteConfirmButton";

interface ChatItemMenuProps {
  chatId: number;
  menuRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const ChatItemMenu: React.FC<ChatItemMenuProps> = ({
  chatId,
  menuRef,
  isMobile,
  setIsSidebarCollapsed,
}) => {
  const {
    setIsRenameDialogOpen,
    setSelectedTabId,
    setIsAddToFolderDialogOpen,
    setSelectedChatId,
    setOpenMenuId,
  } = useUIStore();

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-1 overflow-hidden"
      role="menu"
      aria-label="Меню действий с чатом"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTabId(String(chatId));
          setIsRenameDialogOpen(true);
          setOpenMenuId(null);
          if (isMobile) {
            setIsSidebarCollapsed(true);
          }
        }}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-gray-700"
        role="menuitem"
      >
        <FontAwesomeIcon
          icon="edit"
          className="mr-2 text-zinc-500 dark:text-gray-400"
          aria-hidden="true"
        />
        Переименовать
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedChatId(chatId);
          setIsAddToFolderDialogOpen(true);
          setOpenMenuId(null);
          if (isMobile) {
            setIsSidebarCollapsed(true);
          }
        }}
        className="flex items-center w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-gray-700"
        role="menuitem"
      >
        <FontAwesomeIcon
          icon="folder-plus"
          className="mr-2 text-zinc-500 dark:text-gray-400"
          aria-hidden="true"
        />
        Добавить в темку
      </button>
      <div
        className="border-t border-zinc-200 dark:border-gray-700 my-1"
        role="separator"
      ></div>
      <DeleteConfirmButton
        itemId={chatId}
        itemType="chat"
        onDelete={() => setOpenMenuId(null)}
        onCancel={() => setOpenMenuId(null)}
      />
    </div>
  );
};

export default ChatItemMenu;
