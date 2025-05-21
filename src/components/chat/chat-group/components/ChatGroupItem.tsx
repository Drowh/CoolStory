import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Chat } from "../../../../types";
import { useChatHistoryStore } from "../../../../stores/chatHistory";
import { useUIStore } from "../../../../stores/uiStore";
import ChatItemMenu from "./ChatItemMenu";

interface ChatGroupItemProps {
  chatInfo: { chat: Chat; matchedSnippet?: string };
  handleChatClick: (chatId: string) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const ChatGroupItem: React.FC<ChatGroupItemProps> = ({
  chatInfo,
  handleChatClick,
  menuRef,
}) => {
  const { chat, matchedSnippet } = chatInfo;
  const searchQuery = useChatHistoryStore((state) => state.searchQuery);
  const { openMenuId, setOpenMenuId } = useUIStore();

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const result = [];
    let lastIndex = 0;

    let index = textLower.indexOf(queryLower);
    while (index !== -1) {
      result.push(text.slice(lastIndex, index));
      result.push(
        <span key={index} className="bg-pink-500/30 rounded px-0.5">
          {text.slice(index, index + query.length)}
        </span>
      );
      lastIndex = index + query.length;
      index = textLower.indexOf(queryLower, lastIndex);
    }
    result.push(text.slice(lastIndex));
    return result.length > 1 ? <>{result}</> : text;
  };

  const displayTitle =
    chat.title.length > 30 ? chat.title.slice(0, 30) + "..." : chat.title;

  return (
    <li
      className={`group relative rounded-md overflow-visible transition-all duration-200 ${
        chat.isActive
          ? "bg-gradient-to-r from-gray-700 to-gray-800 shadow-md border-l-2 border-pink-500"
          : "hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 hover:shadow-md"
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
                {highlightMatch(displayTitle, searchQuery)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(
                    openMenuId === String(chat.id) ? null : String(chat.id)
                  );
                }}
                className={`text-gray-400 hover:text-gray-200 ml-1 rounded-full hover:bg-pink-600/70 transition-all duration-200 
                  ${
                    chat.isActive
                      ? "opacity-100"
                      : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  }`}
                aria-label="Открыть меню"
              >
                <FontAwesomeIcon icon="ellipsis-h" />
              </button>
              {openMenuId === String(chat.id) && (
                <ChatItemMenu chatId={chat.id} menuRef={menuRef} />
              )}
            </div>
          </div>
        </div>
        {matchedSnippet && searchQuery ? (
          <div
            className="text-sm text-gray-400 mt-1.5 pl-6 overflow-hidden"
            style={{ maxHeight: "3rem" }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: `...${matchedSnippet}...`,
              }}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400 truncate mt-1.5 pl-6">
            {chat.lastMessage}
          </p>
        )}
      </div>
      {chat.isActive && (
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-600"></div>
      )}
    </li>
  );
};

export default ChatGroupItem;
