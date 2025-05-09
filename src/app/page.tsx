"use client";

import React, { useEffect, useRef } from "react";
import { useMessageStore } from "../stores/messageStore";
import "../utils/lib/fontAwesome";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import ChatInput from "../components/ChatInput";
import RenameDialog from "../components/dialogs/RenameDialog";
import AddToFolderDialog from "../components/dialogs/AddToFolderDialog";
import ModalManager from "@/components/modals/ModalManager";
import { useChatHistory } from "../stores/chatHistoryStore";

const HomePage: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const setMessagesEndRef = useMessageStore((state) => state.setMessagesEndRef);
  useChatHistory();

  useEffect(() => {
    setMessagesEndRef(messagesEndRef);
  }, [setMessagesEndRef]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 md:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex flex-col">
          <div className="overflow-auto">
            <ChatArea />
          </div>
          <ChatInput />
        </main>
      </div>
      <RenameDialog />
      <AddToFolderDialog />
      <ModalManager />
      <div ref={messagesEndRef} className="hidden" />
    </div>
  );
};

export default HomePage;
