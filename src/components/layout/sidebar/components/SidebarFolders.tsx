import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";
import DeleteConfirmButton from "../../../ui/DeleteConfirmButton";
import { useChatHistoryStore } from "../../../../stores/chatHistory";
import { useUIStore } from "../../../../stores/uiStore";
import FolderChatList from "./FolderChatList";

interface SidebarFoldersProps {
  isMobile: boolean;
}

const SidebarFolders: React.FC<SidebarFoldersProps> = ({ isMobile }) => {
  const showFolders = useChatHistoryStore((state) => state.showFolders);
  const setShowFolders = useChatHistoryStore((state) => state.setShowFolders);
  const folders = useChatHistoryStore((state) => state.folders);
  const setIsAddToFolderDialogOpen = useUIStore(
    (state) => state.setIsAddToFolderDialogOpen
  );
  const chatHistory = useChatHistoryStore((state) => state.chatHistory);
  const expandedFolderIds = useUIStore((state) => state.expandedFolderIds);
  const toggleFolderExpansion = useUIStore(
    (state) => state.toggleFolderExpansion
  );
  const selectChat = useChatHistoryStore((state) => state.selectChat);
  const setIsSidebarCollapsed = useUIStore(
    (state) => state.setIsSidebarCollapsed
  );
  const openMenuId = useUIStore((state) => state.openMenuId);
  const setOpenMenuId = useUIStore((state) => state.setOpenMenuId);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleChatClick = (chatId: number) => {
    selectChat(chatId);
    if (isMobile) setIsSidebarCollapsed(true);
  };

  useEffect(() => {
    if (!openMenuId?.includes(":folder-")) return;
    function handleClickOutside(event: MouseEvent) {
      const anyMenuOpen = Object.values(menuRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!anyMenuOpen && openMenuId) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, setOpenMenuId]);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFolders(!showFolders)}
          className="flex items-center px-3 py-2 bg-white hover:bg-zinc-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 shadow-sm"
          aria-expanded={showFolders}
          aria-controls="folder-list"
          aria-label={
            showFolders ? "Скрыть список темок" : "Показать список темок"
          }
        >
          <FontAwesomeIcon
            icon="tags"
            className="text-pink-500 mr-2"
            aria-hidden="true"
          />
          <span className="text-zinc-900 dark:text-gray-200">Темки</span>
        </button>
        {showFolders && (
          <Button
            onClick={() => {
              setIsAddToFolderDialogOpen(true);
              if (isMobile) {
                setIsSidebarCollapsed(true);
              }
            }}
            className="text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 dark:text-gray-400 dark:hover:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-lg"
            aria-label="Создать новую темку"
          >
            <FontAwesomeIcon icon="plus" aria-hidden="true" />
          </Button>
        )}
      </div>
      {showFolders && (
        <div
          id="folder-list"
          className="mt-2"
          role="region"
          aria-label="Список темок"
        >
          {folders.map((folder) => {
            const folderChats = chatHistory.filter(
              (chat) => chat.folderId === folder.id
            );
            const isExpanded = expandedFolderIds.has(folder.id);
            return (
              <div
                key={folder.id}
                role="group"
                aria-label={`Темка ${folder.name}`}
              >
                <div className="flex items-center justify-between py-1">
                  <button
                    onClick={() => toggleFolderExpansion(folder.id)}
                    className="flex items-center text-zinc-900 hover:text-zinc-700 dark:text-gray-200 dark:hover:text-gray-100 w-full text-left"
                    aria-expanded={isExpanded}
                    aria-controls={`folder-chats-${folder.id}`}
                    aria-label={`${
                      isExpanded ? "Свернуть" : "Развернуть"
                    } темку ${folder.name}`}
                  >
                    <FontAwesomeIcon
                      icon={isExpanded ? "chevron-down" : "chevron-right"}
                      className="mr-2 text-zinc-500 dark:text-gray-400"
                      aria-hidden="true"
                    />
                    {folder.name}
                  </button>

                  <DeleteConfirmButton
                    itemId={folder.id}
                    itemType="folder"
                    label=""
                  />
                </div>
                <FolderChatList
                  folderId={folder.id}
                  folderName={folder.name}
                  chats={folderChats}
                  isExpanded={isExpanded}
                  isMobile={isMobile}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  setIsSidebarCollapsed={setIsSidebarCollapsed}
                  handleChatClick={handleChatClick}
                  menuRefs={menuRefs}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarFolders;
