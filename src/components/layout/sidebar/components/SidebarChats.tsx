import React from "react";
import ChatGroup from "../../../chat/chat-group";
import { Chat } from "../../../../types";

interface SidebarChatsProps {
  groupedChats: {
    today: { chat: Chat; matchedSnippet?: string }[];
    older: { chat: Chat; matchedSnippet?: string }[];
  };
  isLoading: boolean;
  isMobile: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarChats: React.FC<SidebarChatsProps> = ({
  groupedChats,
  isMobile,
  setIsSidebarCollapsed,
}) => {
  return (
    <div className="flex-1 px-4 overflow-y-auto pb-4">
      <ChatGroup title="Сегодня" chats={groupedChats.today} isMobile={isMobile} setIsSidebarCollapsed={setIsSidebarCollapsed} />
      <ChatGroup title="Ранее" chats={groupedChats.older} isMobile={isMobile} setIsSidebarCollapsed={setIsSidebarCollapsed} />
    </div>
  );
};

export default SidebarChats;
