import { renderHook, act } from "@testing-library/react";
import { useChatHistoryStore } from "../store";
import { Chat } from "../../../types";
import { CachedMessage } from "../types";

describe("chatHistoryStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useChatHistoryStore());
    act(() => {
      result.current.setChatHistory([]);
      result.current.setFolders([]);
      result.current.setSearchQuery("");
      result.current.setShowFolders(false);
    });
  });

  describe("chatHistory", () => {
    it("должен корректно устанавливать историю чатов", () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockChat: Chat = {
        id: 1,
        title: "Тестовый чат",
        lastMessage: "Последнее сообщение",
        isActive: true,
        hidden: false,
        createdAt: new Date(),
      };

      act(() => {
        result.current.setChatHistory([mockChat]);
      });

      expect(result.current.chatHistory).toEqual([mockChat]);
    });

    it("должен корректно обновлять историю чатов через функцию", () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockChat: Chat = {
        id: 1,
        title: "Тестовый чат",
        lastMessage: "Последнее сообщение",
        isActive: true,
        hidden: false,
        createdAt: new Date(),
      };

      act(() => {
        result.current.setChatHistory((prev) => [...prev, mockChat]);
      });

      expect(result.current.chatHistory).toEqual([mockChat]);
    });
  });

  describe("chatMessagesCache", () => {
    it("должен корректно устанавливать кэш сообщений", () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockMessages: CachedMessage[] = [
        {
          id: "1",
          text: "Тестовое сообщение",
          sender: "user",
        },
      ];

      act(() => {
        result.current.setChatMessagesCache(1, mockMessages);
      });

      expect(result.current.chatMessagesCache[1]).toEqual(mockMessages);
    });

    it("не должен устанавливать кэш при невалидном ID чата", () => {
      const { result } = renderHook(() => useChatHistoryStore());
      const mockMessages: CachedMessage[] = [
        {
          id: "1",
          text: "Тестовое сообщение",
          sender: "user",
        },
      ];

      act(() => {
        result.current.setChatMessagesCache(-1, mockMessages);
      });

      expect(result.current.chatMessagesCache[-1]).toBeUndefined();
    });
  });

  describe("searchQuery", () => {
    it("должен корректно устанавливать поисковый запрос", () => {
      const { result } = renderHook(() => useChatHistoryStore());

      act(() => {
        result.current.setSearchQuery("тест");
      });

      expect(result.current.searchQuery).toBe("тест");
    });

    it("должен корректно обновлять поисковый запрос через функцию", () => {
      const { result } = renderHook(() => useChatHistoryStore());

      act(() => {
        result.current.setSearchQuery((prev) => prev + " тест");
      });

      expect(result.current.searchQuery).toBe(" тест");
    });
  });

  describe("showFolders", () => {
    it("должен корректно переключать видимость папок", () => {
      const { result } = renderHook(() => useChatHistoryStore());

      act(() => {
        result.current.setShowFolders(true);
      });

      expect(result.current.showFolders).toBe(true);

      act(() => {
        result.current.setShowFolders(false);
      });

      expect(result.current.showFolders).toBe(false);
    });
  });
});
