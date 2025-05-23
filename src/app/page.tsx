"use client";

import "../utils/lib/fontAwesome";
import { Header, Sidebar } from "../components/layout";
import { ChatArea, ChatInput } from "../components/chat";
import dynamic from "next/dynamic";
import { useChatHistory } from "../stores/chatHistory";

const RenameDialog = dynamic(
  () => import("../components/dialogs/RenameDialog"),
  { ssr: false }
);
const AddToFolderDialog = dynamic(
  () => import("../components/dialogs/AddToFolderDialog"),
  { ssr: false }
);
const ModalManager = dynamic(() => import("@/components/modals/ModalManager"), {
  ssr: false,
});

const HomePage = () => {
  useChatHistory();

  return (
    <div
      className="flex flex-col min-h-screen bg-white text-zinc-900 dark:bg-gray-900 dark:text-gray-100 md:flex-row"
      role="application"
      aria-label="CoolStory Chat"
    >
      <Sidebar />
      <div
        className="flex flex-col flex-1 w-full"
        role="region"
        aria-label="Основная область чата"
      >
        <Header />
        <main
          className="flex flex-col flex-1 overflow-hidden"
          role="main"
          aria-label="Область сообщений"
        >
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
