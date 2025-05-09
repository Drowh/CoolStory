import { create, StateCreator } from "zustand";
import { Message } from "../types";

interface MessageState {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  inputMessage: string;
  setInputMessage: (value: string | ((prev: string) => string)) => void;
  isTyping: boolean;
  setIsTyping: (value: boolean | ((prev: boolean) => boolean)) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null> | null;
  inputFieldRef: React.RefObject<HTMLTextAreaElement | null> | null;
  setInputFieldRef: (ref: React.RefObject<HTMLTextAreaElement | null>) => void;
  focusInputField: () => void;
  setMessagesEndRef: (
    ref: React.RefObject<HTMLDivElement | null> | null
  ) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  scrollToBottom: () => void;
  messageCache: Record<number, Message[]>;
  addToCache: (chatId: number, messages: Message[]) => void;
  getFromCache: (chatId: number) => Message[] | null;
}

const createMessageStore: StateCreator<MessageState> = (set, get) => ({
  messages: [],
  setMessages: (messages) =>
    set((state) => {
      const newMessages =
        typeof messages === "function" ? messages(state.messages) : messages;

      const uniqueMessages = [];
      const seenIds = new Set();
      const seenContent = new Map();

      for (const msg of newMessages) {
        const contentKey = `${msg.sender}:${msg.text}`;

        if (!seenIds.has(msg.id) && !seenContent.has(contentKey)) {
          seenIds.add(msg.id);
          seenContent.set(contentKey, true);
          uniqueMessages.push(msg);
        }
      }

      return { messages: uniqueMessages };
    }),
  inputMessage: "",
  setInputMessage: (value) =>
    set((state) => ({
      inputMessage:
        typeof value === "function" ? value(state.inputMessage) : value,
    })),
  isTyping: false,
  setIsTyping: (value) =>
    set((state) => ({
      isTyping: typeof value === "function" ? value(state.isTyping) : value,
    })),
  messagesEndRef: null,
  setMessagesEndRef: (ref) =>
    set(() => ({
      messagesEndRef: ref,
    })),
  handleKeyPress: (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  },
  scrollToBottom: () => {
    const { messagesEndRef } = get();
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  },
  inputFieldRef: null,
  setInputFieldRef: (ref) => set({ inputFieldRef: ref }),
  focusInputField: () => {
    const { inputFieldRef } = get();
    if (inputFieldRef?.current) {
      inputFieldRef.current.focus();
    }
  },
  messageCache: {},
  addToCache: (chatId, messages) =>
    set((state) => ({
      messageCache: {
        ...state.messageCache,
        [chatId]: messages,
      },
    })),
  getFromCache: (chatId) => {
    const { messageCache } = get();
    return messageCache[chatId] || null;
  },
});

export const useMessageStore = create<MessageState>(createMessageStore);
