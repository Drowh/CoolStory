import { Chat } from "../../types";
import { levenshteinDistance } from "./utils";
import { ModelService } from "../../services/ModelService";

export const createSearchOperations = (
  getState: () => {
    chatHistory: Chat[];
    searchQuery: string;
    chatMessagesCache: Record<
      number,
      { id: string; text: string; sender: string }[]
    >;
    setChatMessagesCache: (
      chatId: number,
      messages: { id: string; text: string; sender: string }[]
    ) => void;
  }
) => {
  return {
    groupChatsByDate: async () => {
      const groups = {
        today: [] as { chat: Chat; matchedSnippet?: string }[],
        older: [] as { chat: Chat; matchedSnippet?: string }[],
      };
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const {
        chatHistory,
        searchQuery,
        chatMessagesCache,
        setChatMessagesCache,
      } = getState();

      const query = searchQuery.trim().toLowerCase();
      let filteredChats: {
        chat: Chat;
        score: number;
        matchedSnippet?: string;
      }[] = chatHistory
        .filter((chat) => !chat.hidden)
        .map((chat) => ({ chat, score: 0, matchedSnippet: undefined }));

      if (query) {
        const titleMatches: {
          chat: Chat;
          score: number;
          matchedSnippet?: string;
        }[] = [];
        const contentMatches: {
          chat: Chat;
          score: number;
          matchedSnippet?: string;
        }[] = [];

        for (const chatEntry of filteredChats) {
          const chat = chatEntry.chat;
          let score = 0;
          let matchedSnippet: string | undefined = undefined;

          const titleMatch = chat.title.toLowerCase().includes(query);
          if (titleMatch) {
            score += 100;
            const queryIndex = chat.title.toLowerCase().indexOf(query);
            if (queryIndex < 10) score += 20;
            titleMatches.push({ chat, score, matchedSnippet });
            continue;
          }

          if (!chatMessagesCache[chat.id]) {
            try {
              const messages = await ModelService.loadMessages(chat.id);
              const formattedMessages = messages.map((msg, index) => ({
                id: `${chat.id}-${msg.id || index}`,
                text: msg.content || "",
                sender: msg.role as "user" | "assistant",
              }));
              setChatMessagesCache(chat.id, formattedMessages);
            } catch (error) {
              console.error(
                `Error loading messages for chat ${chat.id}:`,
                error
              );
              continue;
            }
          }

          const messages = chatMessagesCache[chat.id] || [];
          if (messages.length > 0) {
            for (const msg of messages) {
              const text = msg.text.toLowerCase();
              if (text.includes(query)) {
                score += 50;
                const queryIndex = text.indexOf(query);
                if (queryIndex < 50) score += 20;
                const start = Math.max(0, queryIndex - 30);
                const end = Math.min(
                  text.length,
                  queryIndex + query.length + 30
                );
                matchedSnippet = text
                  .slice(start, end)
                  .replace(new RegExp(`(${query})`, "gi"), `<mark>$1</mark>`);
                contentMatches.push({ chat, score, matchedSnippet });
                break;
              } else {
                const words = text.split(/\s+/);
                for (const word of words) {
                  const distance = levenshteinDistance(query, word);
                  if (distance <= 2 && word.length >= query.length - 1) {
                    score += 30;
                    const start = Math.max(0, text.indexOf(word) - 20);
                    const end = Math.min(
                      text.length,
                      text.indexOf(word) + word.length + 20
                    );
                    matchedSnippet = `${text.slice(
                      start,
                      text.indexOf(word)
                    )}${word}${text.slice(
                      text.indexOf(word) + word.length,
                      end
                    )}`;

                    break;
                  }
                }
                if (matchedSnippet) break;
              }
            }
            if (score > 0) {
              contentMatches.push({ chat, score, matchedSnippet });
            }
          }
        }

        titleMatches.sort((a, b) => b.score - a.score);
        contentMatches.sort((a, b) => b.score - a.score);

        filteredChats = [...titleMatches, ...contentMatches];
      }

      filteredChats.forEach(({ chat, matchedSnippet }) => {
        const chatDate = chat.createdAt ? new Date(chat.createdAt) : new Date();
        if (chatDate >= today) {
          groups.today.push({ chat, matchedSnippet });
        } else {
          groups.older.push({ chat, matchedSnippet });
        }
      });

      return groups;
    },
  };
};
