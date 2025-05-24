import { Chat, Folder } from "../../types";

/**
 * Тип для сообщения в кэше
 */
export interface CachedMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
}

/**
 * Тип для результата группировки чатов
 */
export interface GroupedChats {
  today: { chat: Chat; matchedSnippet?: string }[];
  older: { chat: Chat; matchedSnippet?: string }[];
}

/**
 * Тип для состояния истории чатов
 */
export interface ChatHistoryState {
  /** Массив чатов */
  chatHistory: Chat[];
  /** Функция для обновления массива чатов */
  setChatHistory: (chatHistory: Chat[] | ((prev: Chat[]) => Chat[])) => void;
  /** Массив папок */
  folders: Folder[];
  /** Функция для обновления массива папок */
  setFolders: (folders: Folder[] | ((prev: Folder[]) => Folder[])) => void;
  /** Поисковый запрос */
  searchQuery: string;
  /** Функция для обновления поискового запроса */
  setSearchQuery: (value: string | ((prev: string) => string)) => void;
  /** Флаг отображения папок */
  showFolders: boolean;
  /** Функция для обновления флага отображения папок */
  setShowFolders: (value: boolean | ((prev: boolean) => boolean)) => void;
  /** Функция для группировки чатов по дате */
  groupChatsByDate: () => Promise<GroupedChats>;
  /** Функция для создания нового чата */
  createNewChat: () => Promise<void>;
  /** Функция для выбора чата */
  selectChat: (chatId: number) => Promise<void>;
  /** Функция для экспорта чата */
  exportChat: () => void;
  /** Функция для обновления последнего сообщения */
  updateLastMessage: (chatId: number, message: string) => Promise<void>;
  /** Функция для добавления чата в папку */
  addChatToFolder: (chatId: number, folderId: number) => Promise<void>;
  /** Функция для создания папки */
  createFolder: (name: string) => Promise<void>;
  /** Функция для удаления папки */
  deleteFolder: (folderId: number) => Promise<void>;
  /** Функция для загрузки чатов */
  loadChats: () => Promise<void>;
  /** Функция для загрузки папок */
  loadFolders: () => Promise<void>;
  /** Функция для переименования чата */
  renameChat: (chatId: number, newTitle: string) => Promise<void>;
  /** Функция для удаления чата */
  deleteChat: (chatId: number) => Promise<void>;
  /** Функция для удаления чата из папки */
  removeChatFromFolder: (chatId: number) => Promise<void>;
  /** ID последнего выбранного чата */
  lastSelectedChatId: number | null;
  /** ID загружаемого чата */
  loadingChatId: number | null;
  /** Флаги загрузки сообщений для каждого чата */
  messagesLoaded: Record<number, boolean>;
  /** Кэш сообщений чатов */
  chatMessagesCache: Record<number, CachedMessage[]>;
  /** Функция для обновления кэша сообщений */
  setChatMessagesCache: (chatId: number, messages: CachedMessage[]) => void;
}
