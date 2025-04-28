import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";
import { useMemo } from "react";
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

  const groupedChats = useMemo(() => {
    console.log("Пересчитываем groupedChats, chatHistory:", chatHistory);
    return groupChatsByDate();
  }, [chatHistory, groupChatsByDate]);

  const favoriteChats = useMemo(() => {
    const allChats = [
      ...groupedChats.today,
      ...groupedChats.yesterday,
      ...groupedChats.lastWeek,
      ...groupedChats.lastMonth,
      ...groupedChats.older,
    ];
    const favorites = allChats
      .filter((chat) => chat.isFavorite)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    console.log("Избранные чаты:", favorites);
    return favorites;
  }, [groupedChats]);

  console.log(
    "Sidebar рендерится, showFavorites:",
    showFavorites,
    "isSidebarCollapsed:",
    isSidebarCollapsed
  );
  console.log(
    "Sidebar классы:",
    isSidebarCollapsed ? "w-16 md:w-16" : "w-full md:w-64"
  );

  return (
    <aside
      className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col custom-scrollbar overflow-y-auto ${
        isSidebarCollapsed ? "w-16 md:w-16" : "w-full md:w-64"
      }`}
    >
      <div className="p-4">
        {!isSidebarCollapsed ? (
          <>
            <SearchBar />
            <div className="flex items-center justify-between space-x-2">
              <Button
                onClick={() => {
                  console.log("Клик на создание нового чата");
                  createNewChat();
                }}
                className="bg-pink-600 hover:bg-pink-700 flex-1 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon="plus" />
                <span>Новый чат</span>
              </Button>
              <Button
                onClick={() => {
                  console.log("Клик на сворачивание боковой панели");
                  setIsSidebarCollapsed(true);
                }}
                className="text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600"
                aria-label="Свернуть боковую панель"
              >
                <FontAwesomeIcon icon="chevron-left" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            onClick={() => {
              console.log("Клик на разворачивание боковой панели");
              setIsSidebarCollapsed(false);
            }}
            className="text-gray-400 hover:text-gray-200 w-full bg-gray-700 hover:bg-gray-600"
            aria-label="Развернуть боковую панель"
          >
            <FontAwesomeIcon icon="chevron-right" />
          </Button>
        )}
      </div>
      {!isSidebarCollapsed && (
        <>
          <div className="px-4 mb-4">
            <button
              onClick={() => {
                console.log("Клик на переключение избранного");
                setShowFavorites(!showFavorites);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon="star" className="text-yellow-500 mr-2" />
                <span>Избранное</span>
              </div>
              <FontAwesomeIcon
                icon={showFavorites ? "chevron-up" : "chevron-down"}
                className="text-gray-400"
              />
            </button>
          </div>
          <div className="flex-1 px-4">
            {showFavorites && (
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
  );
};

export default Sidebar;
