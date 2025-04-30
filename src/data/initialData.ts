import { Chat, Message } from "../types";

export const initialMessages: Message[] = [
  {
    id: 1,
    text: "Привет! Как я могу помочь вам сегодня?",
    sender: "assistant",
  },
];

export const initialChats: Chat[] = [
  {
    id: 1,
    title: "Новый чат",
    lastMessage: "Привет! Чем я могу помочь вам сегодня?",
    isActive: true,
    hidden: false,
  },
  {
    id: 2,
    title: "Помощь с кодом",
    lastMessage: "Я могу помочь с оптимизацией вашего кода",
    isActive: false,
    hidden: false,
  },
  {
    id: 3,
    title: "Идеи для проекта",
    lastMessage: "Вот несколько идей для вашего проекта",
    isActive: false,
    hidden: false,
  },
  {
    id: 4,
    title: "Анализ данных",
    lastMessage: "Результаты анализа готовы",
    isActive: false,
    hidden: false,
  },
  {
    id: 5,
    title: "Планирование",
    lastMessage: "План проекта составлен",
    isActive: false,
    hidden: false,
  },
];
