import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../../stores/chatHistory";
import { useUIStore } from "../../../stores/uiStore";
import { Chat } from "../../../types";
import Image from "next/image";
import {
  SidebarHeader,
  SidebarFolders,
  SidebarChats,
  MobileOverlay,
  MobileToggle,
} from "./components";
import "../../../styles/sidebar.css";

const Sidebar: React.FC = () => {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setIsSidebarCollapsed = useUIStore(
    (state) => state.setIsSidebarCollapsed
  );
  const chatHistory = useChatHistoryStore((state) => state.chatHistory);
  const groupChatsByDate = useChatHistoryStore(
    (state) => state.groupChatsByDate
  );
  const searchQuery = useChatHistoryStore((state) => state.searchQuery);

  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedChats, setGroupedChats] = useState<{
    today: { chat: Chat; matchedSnippet?: string }[];
    older: { chat: Chat; matchedSnippet?: string }[];
  }>({ today: [], older: [] });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isSidebarCollapsed && !window.initialMobileCheck) {
        setIsSidebarCollapsed(true);
        window.initialMobileCheck = true;
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  useEffect(() => {
    const fetchGroupedChats = async () => {
      setIsLoading(true);
      try {
        const result = await groupChatsByDate();
        setGroupedChats(result);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupedChats();
  }, [groupChatsByDate, chatHistory, searchQuery]);

  const showOverlay = !isSidebarCollapsed && isMobile;

  return (
    <>
      {showOverlay && (
        <MobileOverlay onClose={() => setIsSidebarCollapsed(true)} />
      )}

      {isSidebarCollapsed && isMobile && (
        <MobileToggle onClick={() => setIsSidebarCollapsed(false)} />
      )}

      <aside
        className={`
          sidebar
          ${isMobile ? "mobile" : "desktop"}
          ${isSidebarCollapsed ? "collapsed" : "expanded"}
          top-0 left-0 z-[51] h-screen
          bg-white border-r border-zinc-300 text-zinc-900 
          dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
          flex flex-col scroll-fix overflow-y-auto
        `}
        role="navigation"
        aria-label="Боковая панель навигации чатов"
      >
        <SidebarHeader
          isSidebarCollapsed={isSidebarCollapsed}
          isMobile={isMobile}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        {!isSidebarCollapsed && (
          <>
            {isLoading && (
              <div className="flex justify-center py-3">
                <FontAwesomeIcon
                  icon="spinner"
                  className="text-pink-500 animate-spin text-xl"
                  aria-label="Загрузка истории чатов"
                />
              </div>
            )}
            <SidebarFolders isMobile={isMobile} />
            <SidebarChats
              groupedChats={groupedChats}
              isLoading={isLoading}
              isMobile={isMobile}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
            />
          </>
        )}
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] pointer-events-none opacity-10">
          <Image
            src="/assets/icons/logoDrow.png"
            alt="Логотип Drow"
            fill
            sizes="250px"
            className="object-contain"
            priority
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
