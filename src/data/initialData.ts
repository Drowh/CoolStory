import { Chat, Message } from "../types";

export const initialMessages: Message[] = [
  {
    id: 1,
    text: "Привет! Чем я могу помочь вам сегодня?",
    sender: "assistant",
    timestamp: new Date(),
  },
];

export const initialChats: Chat[] = [
  {
    id: 1,
    title: "Новый чат",
    lastMessage: "Привет! Чем я могу помочь вам сегодня?",
    timestamp: new Date(),
    isActive: true,
    hidden: false,
    isFavorite: false,
  },
  {
    id: 2,
    title: "Помощь с кодом",
    lastMessage: "Я могу помочь с оптимизацией вашего кода",
    timestamp: new Date(Date.now() - 86400000),
    isActive: false,
    hidden: false,
    isFavorite: false,
  },
  {
    id: 3,
    title: "Идеи для проекта",
    lastMessage: "Вот несколько идей для вашего проекта",
    timestamp: new Date(Date.now() - 172800000),
    isActive: false,
    hidden: false,
    isFavorite: false,
  },
  {
    id: 4,
    title: "Анализ данных",
    lastMessage: "Результаты анализа готовы",
    timestamp: new Date(Date.now() - 604800000),
    isActive: false,
    hidden: false,
    isFavorite: true,
  },
  {
    id: 5,
    title: "Планирование",
    lastMessage: "План проекта составлен",
    timestamp: new Date(Date.now() - 2592000000),
    isActive: false,
    hidden: false,
    isFavorite: false,
  },
];
