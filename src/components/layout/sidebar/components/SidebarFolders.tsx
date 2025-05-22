import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";
import DeleteConfirmButton from "../../../ui/DeleteConfirmButton";
import { useChatHistoryStore } from "../../../../stores/chatHistory";
import { useUIStore } from "../../../../stores/uiStore";

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

  const handleChatClick = (chatId: number) => {
    selectChat(chatId);
    if (isMobile) setIsSidebarCollapsed(true);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFolders(!showFolders)}
          className="flex items-center px-3 py-2 bg-white hover:bg-zinc-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 shadow-sm"
        >
          <FontAwesomeIcon icon="tags" className="text-pink-500 mr-2" />
          <span className="text-zinc-900 dark:text-gray-200">Темки</span>
        </button>
        {showFolders && (
          <Button
            onClick={() => setIsAddToFolderDialogOpen(true)}
            className="text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 dark:text-gray-400 dark:hover:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-lg"
          >
            <FontAwesomeIcon icon="plus" />
          </Button>
        )}
      </div>
      {showFolders && (
        <div className="mt-2">
          {folders.map((folder) => {
            const folderChats = chatHistory.filter(
              (chat) => chat.folderId === folder.id
            );
            const isExpanded = expandedFolderIds.includes(folder.id);
            return (
              <div key={folder.id}>
                <div className="flex items-center justify-between py-1">
                  <button
                    onClick={() => toggleFolderExpansion(folder.id)}
                    className="flex items-center text-zinc-900 hover:text-zinc-700 dark:text-gray-200 dark:hover:text-gray-100 w-full text-left"
                  >
                    <FontAwesomeIcon
                      icon={isExpanded ? "chevron-down" : "chevron-right"}
                      className="mr-2 text-zinc-500 dark:text-gray-400"
                    />
                    {folder.name}
                  </button>
                  <DeleteConfirmButton
                    itemId={folder.id}
                    itemType="folder"
                    label=""
                  />
                </div>
                {isExpanded && folderChats.length > 0 && (
                  <ul className="pl-6 space-y-1 border-l border-zinc-200 dark:border-gray-700">
                    {folderChats.map((chat) => (
                      <li
                        key={chat.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                          chat.isActive
                            ? "bg-zinc-100 text-zinc-900 dark:bg-gray-700 dark:text-gray-100 border-l-2 border-pink-500"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => handleChatClick(chat.id)}
                      >
                        <span className="flex-1 truncate">{chat.title}</span>
                        <DeleteConfirmButton
                          itemId={chat.id}
                          itemType="chat-from-folder"
                          label=""
                          onDelete={() => {}}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarFolders;
