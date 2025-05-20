import React from "react";
import ChatGroup from "../../../chat/chat-group";
import { Chat } from "../../../../types";

interface SidebarChatsProps {
  groupedChats: {
    today: { chat: Chat; matchedSnippet?: string }[];
    older: { chat: Chat; matchedSnippet?: string }[];
  };
  isLoading: boolean;
}

const SidebarChats: React.FC<SidebarChatsProps> = ({ groupedChats }) => {
  return (
    <div className="flex-1 px-4 overflow-y-auto pb-4">
      <ChatGroup title="Сегодня" chats={groupedChats.today} />
      <ChatGroup title="Ранее" chats={groupedChats.older} />
    </div>
  );
};

export default SidebarChats;
