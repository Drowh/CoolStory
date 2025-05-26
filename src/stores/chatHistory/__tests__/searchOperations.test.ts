import { renderHook, act } from "@testing-library/react";
import { useChatHistoryStore } from "../store";
import { Chat } from "../../../types";
import { CachedMessage } from "../types";

jest.mock("../../../services/ModelService", () => ({
  ModelService: {
    loadMessages: jest.fn().mockResolvedValue([
      {
        id: "1",
        content: "Тестовое сообщение",
        role: "user",
      },
    ]),
  },
}));

describe("searchOperations", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useChatHistoryStore());
    act(() => {
      result.current.setChatHistory([]);
      result.current.setSearchQuery("");
    });
  });

  describe("groupChatsByDate", () => {
    it("должен группировать чаты по дате без поискового запроса", async () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockChats: Chat[] = [
        {
          id: 1,
          title: "Сегодняшний чат",
          lastMessage: "Последнее сообщение",
          isActive: true,
          hidden: false,
          createdAt: today,
        },
        {
          id: 2,
          title: "Вчерашний чат",
          lastMessage: "Последнее сообщение",
          isActive: false,
          hidden: false,
          createdAt: yesterday,
        },
      ];

      await act(async () => {
        result.current.setChatHistory(mockChats);
      });

      const groups = await act(async () => {
        return await result.current.groupChatsByDate();
      });

      expect(groups.today.length).toBe(1);
      expect(groups.older.length).toBe(1);
      expect(groups.today[0].chat.title).toBe("Сегодняшний чат");
      expect(groups.older[0].chat.title).toBe("Вчерашний чат");
    });

    it("должен фильтровать чаты по поисковому запросу", async () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockChats: Chat[] = [
        {
          id: 1,
          title: "Тестовый чат",
          lastMessage: "Последнее сообщение",
          isActive: true,
          hidden: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Другой чат",
          lastMessage: "Другое сообщение",
          isActive: false,
          hidden: false,
          createdAt: new Date(),
        },
      ];

      await act(async () => {
        result.current.setChatHistory(mockChats);
        result.current.setSearchQuery("Тест");
      });

      const groups = await act(async () => {
        return await result.current.groupChatsByDate();
      });

      expect(groups.today.length).toBe(1);
      expect(groups.older.length).toBe(0);
      expect(groups.today[0].chat.title).toBe("Тестовый чат");
    });

    it("должен искать по содержимому сообщений", async () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockChats: Chat[] = [
        {
          id: 1,
          title: "Чат без совпадений",
          lastMessage: "Последнее сообщение",
          isActive: true,
          hidden: false,
          createdAt: new Date(),
        },
      ];

      const mockMessages: CachedMessage[] = [
        {
          id: "1",
          text: "Сообщение с тестовым текстом",
          sender: "user",
        },
      ];

      await act(async () => {
        result.current.setChatHistory(mockChats);
        result.current.setSearchQuery("тестовым");
        result.current.setChatMessagesCache(1, mockMessages);
      });

      const groups = await act(async () => {
        return await result.current.groupChatsByDate();
      });

      expect(groups.today.length).toBe(1);
      expect(groups.older.length).toBe(0);
      expect(groups.today[0].matchedSnippet).toContain("тестовым");
    });

    it("не должен включать скрытые чаты в результаты поиска", async () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockChats: Chat[] = [
        {
          id: 1,
          title: "Скрытый чат",
          lastMessage: "Последнее сообщение",
          isActive: true,
          hidden: true,
          createdAt: new Date(),
        },
      ];

      await act(async () => {
        result.current.setChatHistory(mockChats);
        result.current.setSearchQuery("Скрытый");
      });

      const groups = await act(async () => {
        return await result.current.groupChatsByDate();
      });

      expect(groups.today.length).toBe(0);
      expect(groups.older.length).toBe(0);
    });
  });
});
