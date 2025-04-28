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
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans md:flex-row">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 flex flex-col bg-gray-900">
          <ChatArea />
          <ChatInput />
        </main>
      </div>
      <RenameDialog />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default HomePage;
