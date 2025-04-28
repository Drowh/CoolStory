import { create, StateCreator } from "zustand";
import { Message } from "../types";
import { initialMessages } from "../data/initialData";
import { sendMessageToAPI } from "../utils/api";
import { useChatHistoryStore } from "./chatHistoryStore";

interface MessageState {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  inputMessage: string;
  setInputMessage: (value: string | ((prev: string) => string)) => void;
  isTyping: boolean;
  setIsTyping: (value: boolean | ((prev: boolean) => boolean)) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null> | null;
  setMessagesEndRef: (
    ref: React.RefObject<HTMLDivElement | null> | null
  ) => void;
  handleSendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  scrollToBottom: () => void;
}

const createMessageStore: StateCreator<MessageState> = (set, get) => ({
  messages: initialMessages,
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),
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
  handleSendMessage: async () => {
    const {
      inputMessage,
      messages,
      setMessages,
      setInputMessage,
      setIsTyping,
    } = get();
    if (inputMessage.trim() === "") return;

    // Находим активный чат
    const activeChat = useChatHistoryStore
      .getState()
      .chatHistory.find((chat) => chat.isActive);
    if (!activeChat) {
      console.error("Нет активного чата");
      return;
    }

    const newUserMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Обновляем последнее сообщение в чате
    useChatHistoryStore
      .getState()
      .updateLastMessage(activeChat.id, inputMessage);

    try {
      const reply = await sendMessageToAPI(inputMessage);
      const assistantReply: Message = {
        id: Date.now() + 1,
        text: reply,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantReply]);

      // Обновляем последнее сообщение в чате ответом ассистента
      useChatHistoryStore.getState().updateLastMessage(activeChat.id, reply);
    } catch (error) {
      console.error("Ошибка API:", error);
    } finally {
      setIsTyping(false);
    }
  },
  handleKeyPress: (e: React.KeyboardEvent) => {
    const { handleSendMessage } = get();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  },
  scrollToBottom: () => {
    const { messagesEndRef } = get();
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  },
});

export const useMessageStore = create<MessageState>(createMessageStore);
