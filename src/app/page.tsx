"use client";

import React, { useEffect, useRef } from "react";
import { useMessageStore } from "../stores/messageStore";
import "../utils/lib/fontAwesome";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import ChatInput from "../components/ChatInput";
import RenameDialog from "../components/dialogs/RenameDialog";

const HomePage: React.FC = () => {
  console.log("HomePage рендерится");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const setMessagesEndRef = useMessageStore((state) => state.setMessagesEndRef);

  useEffect(() => {
    console.log("useEffect вызван, устанавливаем messagesEndRef");
    setMessagesEndRef(messagesEndRef);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-gray-100 md:flex-row w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <Header />
        <main className="flex-1 flex flex-col w-full">
          <div className="flex-1 overflow-hidden w-full">
            <ChatArea />
          </div>
          <ChatInput />
        </main>
      </div>
      <RenameDialog />
      <div ref={messagesEndRef} className="hidden" />
    </div>
  );
};

export default HomePage;
