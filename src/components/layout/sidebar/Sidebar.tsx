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

  const sidebarBaseClasses = `
    top-0 left-0 z-[51]
    bg-gray-800 border-r border-gray-700 
    transition-all duration-300 flex flex-col
    custom-scrollbar overflow-y-auto
  `;

  const sidebarVisibilityClasses = isMobile
    ? isSidebarCollapsed
      ? "fixed -translate-x-full"
      : "fixed w-64 translate-x-0 h-screen"
    : isSidebarCollapsed
    ? "sticky w-16 translate-x-0 h-screen"
    : "sticky w-64 translate-x-0 h-screen";

  const showOverlay = !isSidebarCollapsed && isMobile;

  return (
    <>
      {showOverlay && (
        <MobileOverlay onClose={() => setIsSidebarCollapsed(true)} />
      )}

      {isSidebarCollapsed && isMobile && (
        <MobileToggle onClick={() => setIsSidebarCollapsed(false)} />
      )}

      <aside className={`${sidebarBaseClasses} ${sidebarVisibilityClasses}`}>
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
                />
              </div>
            )}
            <SidebarFolders isMobile={isMobile} />
            <SidebarChats groupedChats={groupedChats} isLoading={isLoading} />
          </>
        )}
        <Image
          src="/assets/icons/logoDrow.png"
          alt="Drow Logo"
          className="opacity-10 w-[250px] h-auto absolute bottom-0 pointer-events-none"
          width={250}
          height={100}
          priority
        />
      </aside>
    </>
  );
};

export default Sidebar;
