import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";
import { useMemo, useEffect, useState } from "react";
import SearchBar from "../chat/SearchBar";
import ChatGroup from "../chat/ChatGroup";
import Button from "../ui/Button";

const Sidebar: React.FC = () => {
  const showFavorites = useChatHistoryStore((state) => state.showFavorites);
  const setShowFavorites = useChatHistoryStore(
    (state) => state.setShowFavorites
  );
  const groupChatsByDate = useChatHistoryStore(
    (state) => state.groupChatsByDate
  );
  const createNewChat = useChatHistoryStore((state) => state.createNewChat);
  const chatHistory = useChatHistoryStore((state) => state.chatHistory);

  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setIsSidebarCollapsed = useUIStore(
    (state) => state.setIsSidebarCollapsed
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile(); // при монтировании

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  const groupedChats = useMemo(
    () => groupChatsByDate(),
    [chatHistory, groupChatsByDate]
  );

  const favoriteChats = useMemo(() => {
    const allChats = [
      ...groupedChats.today,
      ...groupedChats.yesterday,
      ...groupedChats.lastWeek,
      ...groupedChats.lastMonth,
      ...groupedChats.older,
    ];
    return allChats.filter((chat) => chat.isFavorite);
  }, [groupedChats]);

  const sidebarBaseClasses = `
    sticky top-0 left-0 h-full z-40
    bg-gray-800 border-r border-gray-700 
    transition-all duration-300 flex flex-col
    custom-scrollbar overflow-y-auto
  `;

  const sidebarVisibilityClasses = isSidebarCollapsed
    ? "w-16 md:w-16 translate-x-0"
    : "w-64 translate-x-0";

  const showOverlay = !isSidebarCollapsed && isMobile;

  return (
    <>
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed top-4 left-4 z-30 md:hidden bg-gray-800 hover:bg-gray-700 text-gray-200 p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
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
                onClick={() => createNewChat()}
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
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200 shadow-sm"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon="star"
                    className="text-yellow-500 mr-2"
                  />
                  <span className="text-gray-200">Избранное</span>
                </div>
                <FontAwesomeIcon
                  icon={showFavorites ? "chevron-up" : "chevron-down"}
                  className="text-gray-400"
                />
              </button>
            </div>
            <div className="flex-1 px-4 overflow-y-auto pb-4">
              {showFavorites && favoriteChats.length > 0 && (
                <ChatGroup title="Избранное" chats={favoriteChats} />
              )}
              <ChatGroup title="Сегодня" chats={groupedChats.today} />
              <ChatGroup title="Вчера" chats={groupedChats.yesterday} />
              <ChatGroup title="Прошлая неделя" chats={groupedChats.lastWeek} />
              <ChatGroup title="Прошлый месяц" chats={groupedChats.lastMonth} />
              <ChatGroup title="Ранее" chats={groupedChats.older} />
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
