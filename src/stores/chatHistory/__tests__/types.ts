import { User } from "@supabase/supabase-js";
import { Message } from "../../../types";

export interface MockUserResponse {
  data: {
    user: User | null;
  };
  error: null;
}

export interface MockChatData {
  id: number;
  title: string;
  last_message: string;
  is_active: boolean;
  hidden: boolean;
  created_at: string;
}

export interface MockChatResponse {
  data: MockChatData;
  error: null;
}

export interface MockPostgrestBuilder {
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  single: jest.Mock<Promise<{ data: MockChatData; error: null }>>;
}

export type MockGetUser = jest.Mock<Promise<MockUserResponse>>;
export type MockFrom = jest.Mock<() => MockPostgrestBuilder>;
export type MockLoadMessages = jest.Mock<Promise<Message[]>>;

export interface MockSupabase {
  auth: {
    getUser: MockGetUser;
  };
  from: MockFrom;
}

export interface MockModelService {
  loadMessages: MockLoadMessages;
}

export const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
};

export const mockUserResponse: MockUserResponse = {
  data: {
    user: mockUser,
  },
  error: null,
};

export const mockNullUserResponse: MockUserResponse = {
  data: {
    user: null,
  },
  error: null,
};

export const mockChatResponse: MockChatResponse = {
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

export const mockBuilder: MockPostgrestBuilder = {
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest
    .fn()
    .mockResolvedValue({ data: mockChatResponse.data, error: null }),
};

export const mockModelService = {
  loadMessages: jest.fn().mockResolvedValue(mockMessages),
};
