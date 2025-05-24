import { create, StateCreator } from "zustand";
import { Message } from "../types";
import DOMPurify from "dompurify";
import { useCallback, useMemo } from "react";

type MessageSender = "user" | "assistant";

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
  messageCache: Map<number, Message[]>;
  addToCache: (chatId: number, messages: Message[]) => void;
  getFromCache: (chatId: number) => Message[] | null;
  clearCache: () => void;
}

const MAX_CACHE_SIZE = 100;
const MAX_MESSAGE_LENGTH = 10000;
const SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: "smooth",
  block: "end",
};

const sanitizeMessage = (message: Message): Message => {
  if (!message || typeof message !== "object") {
    throw new Error("Invalid message format");
  }

  const sanitizedText = DOMPurify.sanitize(message.text.trim(), {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "code", "pre"],
    ALLOWED_ATTR: ["href", "target"],
  });

  return {
    ...message,
    text: sanitizedText,
    sender: message.sender as MessageSender,
  };
};

const validateMessage = (message: Message): boolean => {
  if (!message || typeof message !== "object") return false;
  if (!message.id || typeof message.id !== "string") return false;
  if (!message.text || typeof message.text !== "string") return false;
  if (message.text.length > MAX_MESSAGE_LENGTH) return false;
  if (!["user", "assistant"].includes(message.sender)) return false;
  return true;
};

const createMessageStore: StateCreator<MessageState> = (set, get) => ({
  messages: [],
  setMessages: (messages) =>
    set((state) => {
      const newMessages =
        typeof messages === "function" ? messages(state.messages) : messages;

      const uniqueMessages: Message[] = [];
      const seenIds = new Set<string>();
      const seenContent = new Map<string, boolean>();

      for (const msg of newMessages) {
        if (!validateMessage(msg)) continue;

        try {
          const sanitizedMsg = sanitizeMessage(msg);
          const contentKey = `${sanitizedMsg.sender}:${sanitizedMsg.text}`;

          if (!seenIds.has(sanitizedMsg.id) && !seenContent.has(contentKey)) {
            seenIds.add(sanitizedMsg.id);
            seenContent.set(contentKey, true);
            uniqueMessages.push(sanitizedMsg);
          }
        } catch (error) {
          console.error("Error sanitizing message:", error);
          continue;
        }
      }

      return { messages: uniqueMessages };
    }),
  inputMessage: "",
  setInputMessage: (value) =>
    set((state) => ({
      inputMessage: DOMPurify.sanitize(
        typeof value === "function" ? value(state.inputMessage) : value,
        {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        }
      ),
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
    messagesEndRef?.current?.scrollIntoView(SCROLL_OPTIONS);
  },
  inputFieldRef: null,
  setInputFieldRef: (ref) => set({ inputFieldRef: ref }),
  focusInputField: () => {
    const { inputFieldRef } = get();
    if (inputFieldRef?.current) {
      inputFieldRef.current.focus();
    }
  },
  messageCache: new Map(),
  addToCache: (chatId, messages) =>
    set((state) => {
      const newCache = new Map(state.messageCache);

      if (newCache.size >= MAX_CACHE_SIZE) {
        const firstKey = newCache.keys().next().value;
        if (firstKey !== undefined) {
          newCache.delete(firstKey);
        }
      }

      newCache.set(chatId, messages.map(sanitizeMessage));
      return { messageCache: newCache };
    }),
  getFromCache: (chatId) => {
    const { messageCache } = get();
    return messageCache.get(chatId) || null;
  },
  clearCache: () => set({ messageCache: new Map() }),
});

export const useMessageStore = create<MessageState>(createMessageStore);

export const useMessageStoreOptimized = () => {
  const store = useMessageStore();

  const setMessages = useCallback(
    (messages: Message[] | ((prev: Message[]) => Message[])) => {
      store.setMessages(messages);
    },
    [store]
  );

  const setInputMessage = useCallback(
    (value: string | ((prev: string) => string)) => {
      store.setInputMessage(value);
    },
    [store]
  );

  const scrollToBottom = useCallback(() => {
    store.scrollToBottom();
  }, [store]);

  const focusInputField = useCallback(() => {
    store.focusInputField();
  }, [store]);

  const messages = useMemo(() => store.messages, [store.messages]);
  const inputMessage = useMemo(() => store.inputMessage, [store.inputMessage]);
  const isTyping = useMemo(() => store.isTyping, [store.isTyping]);

  return {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isTyping,
    setIsTyping: store.setIsTyping,
    messagesEndRef: store.messagesEndRef,
    setMessagesEndRef: store.setMessagesEndRef,
    inputFieldRef: store.inputFieldRef,
    setInputFieldRef: store.setInputFieldRef,
    handleKeyPress: store.handleKeyPress,
    scrollToBottom,
    focusInputField,
    messageCache: store.messageCache,
    addToCache: store.addToCache,
    getFromCache: store.getFromCache,
    clearCache: store.clearCache,
  };
};
