import { Chat, Folder } from "../../types";

export interface ChatHistoryState {
  chatHistory: Chat[];
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  folders: Folder[];
  setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
  searchQuery: string;
  setSearchQuery: (value: string | ((prev: string) => string)) => void;
  showFolders: boolean;
  setShowFolders: (value: boolean | ((prev: boolean) => boolean)) => void;
  groupChatsByDate: () => Promise<{
    today: { chat: Chat; matchedSnippet?: string }[];
    older: { chat: Chat; matchedSnippet?: string }[];
  }>;
  createNewChat: () => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  exportChat: () => void;
  updateLastMessage: (chatId: number, message: string) => Promise<void>;
  addChatToFolder: (chatId: number, folderId: number) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (folderId: number) => Promise<void>;
  loadChats: () => Promise<void>;
  loadFolders: () => Promise<void>;
  renameChat: (chatId: number, newTitle: string) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
  removeChatFromFolder: (chatId: number) => Promise<void>;
  lastSelectedChatId: number | null;
  loadingChatId: number | null;
  messagesLoaded: Record<number, boolean>;
  chatMessagesCache: Record<
    number,
    { id: string; text: string; sender: string }[]
  >;
  setChatMessagesCache: (
    chatId: number,
    messages: { id: string; text: string; sender: string }[]
  ) => void;
}
