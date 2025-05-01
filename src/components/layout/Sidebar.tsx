import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";
import { useMemo, useEffect, useState } from "react";
import SearchBar from "../chat/SearchBar";
import ChatGroup from "../chat/ChatGroup";
import Button from "../ui/Button";
import DeleteFolderButton from "../ui/DeleteFolderButton";

const Sidebar: React.FC = () => {
  const showFolders = useChatHistoryStore((state) => state.showFolders);
  const setShowFolders = useChatHistoryStore((state) => state.setShowFolders);
  const folders = useChatHistoryStore((state) => state.folders);
  const chatHistory = useChatHistoryStore((state) => state.chatHistory);
  const groupChatsByDate = useChatHistoryStore(
    (state) => state.groupChatsByDate
  );
  const createNewChat = useChatHistoryStore((state) => state.createNewChat);
  const selectChat = useChatHistoryStore((state) => state.selectChat);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setIsSidebarCollapsed = useUIStore(
    (state) => state.setIsSidebarCollapsed
  );
  const setIsAddToFolderDialogOpen = useUIStore(
    (state) => state.setIsAddToFolderDialogOpen
  );
  const expandedFolderIds = useUIStore((state) => state.expandedFolderIds);
  const toggleFolderExpansion = useUIStore(
    (state) => state.toggleFolderExpansion
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Только автоматически сворачиваем при начальной загрузке на мобильном,
      // но не при каждом изменении размера
      if (mobile && !isSidebarCollapsed && !window.initialMobileCheck) {
        setIsSidebarCollapsed(true);
        window.initialMobileCheck = true;
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  const groupedChats = useMemo(
    () => groupChatsByDate(),
    [groupChatsByDate, chatHistory]
  );

  const sidebarBaseClasses = `
    top-0 left-0 z-40
    bg-gray-800 border-r border-gray-700 
    transition-all duration-300 flex flex-col
    custom-scrollbar overflow-y-auto
  `;

  // Изменяем классы видимости для мобильных устройств
  const sidebarVisibilityClasses = isMobile
    ? isSidebarCollapsed
      ? "fixed -translate-x-full" // Полностью скрываем за пределами экрана
      : "fixed w-64 translate-x-0 h-screen"
    : isSidebarCollapsed
    ? "sticky w-16 translate-x-0 h-screen"
    : "sticky w-64 translate-x-0 h-screen";

  const showOverlay = !isSidebarCollapsed && isMobile;

  return (
    <>
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {isSidebarCollapsed && isMobile && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed top-1 left-2 z-30 md:hidden bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
          aria-label="Открыть меню"
        >
          <FontAwesomeIcon icon="bars" />
        </button>
      )}

      <aside className={`${sidebarBaseClasses} ${sidebarVisibilityClasses}`}>
        <div className="p-4 border-b border-gray-700">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <SearchBar />
                <Button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
                  aria-label="Свернуть боковую панель"
                >
                  <FontAwesomeIcon icon="chevron-left" />
                </Button>
              </div>
              <Button
                onClick={() => {
                  createNewChat();
                  if (isMobile) {
                    setIsSidebarCollapsed(true);
                  }
                }}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 w-full mt-4 flex items-center justify-center space-x-2 py-2 rounded-lg transform transition-transform duration-200 hover:scale-102 shadow-md"
              >
                <span>Новый чат</span>
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Button
                onClick={() => setIsSidebarCollapsed(false)}
                className="text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg w-full"
                aria-label="Развернуть боковую панель"
              >
                <FontAwesomeIcon icon="chevron-right" />
              </Button>
              <Button
                onClick={() => createNewChat()}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 p-2 rounded-lg transform transition-transform duration-200 hover:scale-105 shadow-md"
                aria-label="Новый чат"
              >
                <FontAwesomeIcon icon="plus" />
              </Button>
            </div>
          )}
        </div>

        {!isSidebarCollapsed && (
          <>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFolders(!showFolders)}
                  className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200 shadow-sm"
                >
                  <FontAwesomeIcon icon="tags" className="text-pink-500 mr-2" />
                  <span className="text-gray-200">Темки</span>
                </button>
                {showFolders && (
                  <Button
                    onClick={() => setIsAddToFolderDialogOpen(true)}
                    className="text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
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
                            className="flex items-center text-gray-200 hover:text-gray-100 w-full text-left"
                          >
                            <FontAwesomeIcon
                              icon={
                                isExpanded ? "chevron-down" : "chevron-right"
                              }
                              className="mr-2 text-gray-400"
                            />
                            {folder.name}
                          </button>
                          <DeleteFolderButton folderId={folder.id} />
                        </div>
                        {isExpanded && folderChats.length > 0 && (
                          <ul className="pl-6 space-y-1">
                            {folderChats.map((chat) => (
                              <li
                                key={chat.id}
                                className={`p-2 rounded-md cursor-pointer ${
                                  chat.isActive
                                    ? "bg-gray-700 text-gray-100"
                                    : "text-gray-300 hover:bg-gray-700"
                                }`}
                                onClick={() => {
                                  selectChat(chat.id);
                                  if (isMobile) {
                                    setIsSidebarCollapsed(true);
                                  }
                                }}
                              >
                                {chat.title}
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
            <div className="flex-1 px-4 overflow-y-auto pb-4">
              <ChatGroup title="Сегодня" chats={groupedChats.today} />
              <ChatGroup title="Ранее" chats={groupedChats.older} />
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
