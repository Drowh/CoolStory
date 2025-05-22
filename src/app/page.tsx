"use client";

import "../utils/lib/fontAwesome";
import { Header, Sidebar } from "../components/layout";
import { ChatArea, ChatInput } from "../components/chat";
import RenameDialog from "../components/dialogs/RenameDialog";
import AddToFolderDialog from "../components/dialogs/AddToFolderDialog";
import ModalManager from "@/components/modals/ModalManager";
import { useChatHistory } from "../stores/chatHistory";

const HomePage = () => {
  useChatHistory();

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 dark:bg-gray-900 dark:text-gray-100 md:flex-row ">
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
