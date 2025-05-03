import { create, StateCreator } from "zustand";
import { Message } from "../types";
import { initialMessages } from "../data/initialData";
import { sendMessageToAPI } from "../utils/api";
import { useChatHistoryStore } from "./chatHistoryStore";
import { supabase } from "../utils/supabase";

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
  setMessagesEndRef: (ref: React.RefObject<HTMLDivElement | null> | null) => void;
  handleSendMessage: () => Promise<void>;
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
  handleSendMessage: async () => {
    const { inputMessage, messages, setMessages, setInputMessage, setIsTyping } = get();
    if (inputMessage.trim() === "") return;

    const activeChat = useChatHistoryStore.getState().chatHistory.find((chat) => chat.isActive);
    if (!activeChat) {
      console.error("Нет активного чата");
      return;
    }

    const newUserMessage: Message = {
      id: Date.now(), // Замени на UUID из Supabase позже
      text: inputMessage,
      sender: "user",
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Сохранение сообщения пользователя
    const { error: userMsgError } = await supabase.from("messages").insert({
      chat_id: activeChat.id,
      text: inputMessage,
      sender: "user",
    });
    if (userMsgError) console.error("Ошибка сохранения сообщения:", userMsgError);

    useChatHistoryStore.getState().updateLastMessage(activeChat.id, inputMessage);

    try {
      const reply = await sendMessageToAPI(inputMessage);
      const assistantReply: Message = {
        id: Date.now() + 1, // Замени на UUID из Supabase позже
        text: reply,
        sender: "assistant",
      };
      setMessages((prev) => [...prev, assistantReply]);

      const { error: assistantMsgError } = await supabase.from("messages").insert({
        chat_id: activeChat.id,
        text: reply,
        sender: "assistant",
      });
      if (assistantMsgError) console.error("Ошибка сохранения ответа:", assistantMsgError);

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