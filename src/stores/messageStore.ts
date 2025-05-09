import { create, StateCreator } from "zustand";
import { Message } from "../types";
import { initialMessages } from "../data/initialData";

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
}

const createMessageStore: StateCreator<MessageState> = (set, get) => ({
  messages: initialMessages.map((msg) => ({
    id: msg.id,
    text: msg.text,
    sender: msg.sender,
  })),
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
  handleKeyPress: (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  },
  scrollToBottom: () => {
    const { messagesEndRef } = get();
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  },
  inputFieldRef: null,
  setInputFieldRef: (ref) => set({ inputFieldRef: ref }),
  focusInputField: () => {
    const { inputFieldRef } = get();
    if (inputFieldRef?.current) {
      inputFieldRef.current.focus();
    }
  },
});

export const useMessageStore = create<MessageState>(createMessageStore);
