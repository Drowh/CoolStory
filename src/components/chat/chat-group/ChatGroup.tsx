import React, { useEffect, useRef } from "react";
import { Chat } from "../../../types";
import { useUIStore } from "../../../stores/uiStore";
import ChatGroupList from "./components/ChatGroupList";

interface ChatGroupProps {
  title: string;
  chats: { chat: Chat; matchedSnippet?: string }[];
}

const ChatGroup: React.FC<ChatGroupProps> = ({ title, chats }) => {
  const { openMenuId, setOpenMenuId } = useUIStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        openMenuId
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, setOpenMenuId]);

  if (!chats.length) return null;

  return (
    <div className="mb-4">
      <h3 className="text-xs uppercase text-gray-400 font-semibold px-3 py-2 tracking-wider">
        {title}
      </h3>
      <ChatGroupList
        chats={chats}
        menuRef={menuRef as React.RefObject<HTMLDivElement>}
      />
    </div>
  );
};

export default ChatGroup;
