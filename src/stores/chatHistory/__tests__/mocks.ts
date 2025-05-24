import { User } from "@supabase/supabase-js";
import { Message } from "../../../types";

export const mockUser = { id: "test-user-id" } as User;

export const mockUserResponse = {
  data: { user: mockUser },
  error: null,
};

export const mockNullUserResponse = {
  data: { user: null },
  error: null,
};

export const mockChatResponse = {
  data: {
    id: 1,
    title: "Новый чат",
    last_message: "Начните новый разговор",
    is_active: true,
    hidden: false,
    created_at: new Date().toISOString(),
  },
  error: null,
};

export const mockMessages: Message[] = [
  {
    id: "1",
    text: "Тестовое сообщение",
    sender: "user",
  },
];
