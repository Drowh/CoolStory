"use client";

import "../utils/lib/fontAwesome";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import ChatInput from "../components/ChatInput";
import RenameDialog from "../components/dialogs/RenameDialog";
import AddToFolderDialog from "../components/dialogs/AddToFolderDialog";
import ModalManager from "@/components/modals/ModalManager";
import { useChatHistory } from "../stores/chatHistoryStore";

const HomePage = () => {
  useChatHistory();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 md:flex-row ">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <Header />
        <main className="flex flex-col flex-1 overflow-hidden">
          <ChatArea />
          <ChatInput />
        </main>
      </div>
      <RenameDialog />
      <AddToFolderDialog />
      <ModalManager />
    </div>
  );
};

export default HomePage;
