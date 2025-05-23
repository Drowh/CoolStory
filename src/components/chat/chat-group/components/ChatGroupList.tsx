import React from "react";
import { Chat } from "../../../../types";
import { useChatHistoryStore } from "../../../../stores/chatHistory";
import ChatGroupItem from "./ChatGroupItem";

interface ChatGroupListProps {
  chats: { chat: Chat; matchedSnippet?: string }[];
  menuRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const ChatGroupList: React.FC<ChatGroupListProps> = ({
  chats,
  menuRef,
  isMobile,
  setIsSidebarCollapsed,
}) => {
  const { selectChat } = useChatHistoryStore();

  const handleChatClick = (chatId: string) => {
    selectChat(parseInt(chatId, 10));
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <ul className="space-y-1.5 cursor-pointer">
      {chats.map((chatInfo, index) => (
        <ChatGroupItem
          key={`${chatInfo.chat.id}-${index}`}
          chatInfo={chatInfo}
          handleChatClick={handleChatClick}
          menuRef={menuRef}
          isMobile={isMobile}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      ))}
    </ul>
  );
};

export default ChatGroupList;
