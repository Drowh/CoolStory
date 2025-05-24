import { Chat } from "../../types";
import { levenshteinDistance } from "./utils";
import { ModelService } from "../../services/ModelService";
import { CachedMessage } from "./types";

interface SearchOperationsState {
  chatHistory: Chat[];
  searchQuery: string;
  chatMessagesCache: Record<number, CachedMessage[]>;
  setChatMessagesCache: (chatId: number, messages: CachedMessage[]) => void;
}

interface ChatMatch {
  chat: Chat;
  score: number;
  matchedSnippet?: string;
}

interface ChatGroups {
  today: { chat: Chat; matchedSnippet?: string }[];
  older: { chat: Chat; matchedSnippet?: string }[];
}

const validateSearchQuery = (query: unknown): query is string => {
  return typeof query === "string" && query.length >= 0;
};

const calculateMatchScore = (
  text: string,
  query: string,
  isTitle: boolean = false
): { score: number; matchedSnippet?: string } => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  let score = 0;
  let matchedSnippet: string | undefined;

  if (textLower.includes(queryLower)) {
    score += isTitle ? 100 : 50;
    const queryIndex = textLower.indexOf(queryLower);
    if (queryIndex < (isTitle ? 10 : 50)) score += 20;

    const start = Math.max(0, queryIndex - (isTitle ? 20 : 30));
    const end = Math.min(
      text.length,
      queryIndex + query.length + (isTitle ? 20 : 30)
    );
    matchedSnippet = text
      .slice(start, end)
      .replace(new RegExp(`(${query})`, "gi"), "<mark>$1</mark>");
  } else {
    const words = textLower.split(/\s+/);
    for (const word of words) {
      const distance = levenshteinDistance(queryLower, word);
      if (distance <= 2 && word.length >= queryLower.length - 1) {
        score += isTitle ? 50 : 30;
        const wordIndex = textLower.indexOf(word);
        const start = Math.max(0, wordIndex - 20);
        const end = Math.min(text.length, wordIndex + word.length + 20);
        matchedSnippet = text.slice(start, end);
        break;
      }
    }
  }

  return { score, matchedSnippet };
};

export const createSearchOperations = (
  getState: () => SearchOperationsState
) => {
  return {
    groupChatsByDate: async () => {
      try {
        const {
          chatHistory,
          searchQuery,
          chatMessagesCache,
          setChatMessagesCache,
        } = getState();

        if (!validateSearchQuery(searchQuery)) {
          console.error("Невалидный поисковый запрос:", searchQuery);
          return { today: [], older: [] };
        }

        const groups: ChatGroups = {
          today: [],
          older: [],
        };

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const query = searchQuery.trim().toLowerCase();

        let filteredChats: ChatMatch[] = chatHistory
          .filter((chat) => !chat.hidden)
          .map((chat) => ({ chat, score: 0 }));

        if (query) {
          const titleMatches: ChatMatch[] = [];
          const contentMatches: ChatMatch[] = [];

          for (const chatEntry of filteredChats) {
            const chat = chatEntry.chat;

            const titleResult = calculateMatchScore(chat.title, query, true);
            if (titleResult.score > 0) {
              titleMatches.push({
                chat,
                score: titleResult.score,
                matchedSnippet: titleResult.matchedSnippet,
              });
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
                  `Ошибка загрузки сообщений для чата ${chat.id}:`,
                  error
                );
                continue;
              }
            }

            const messages = chatMessagesCache[chat.id] || [];
            if (messages.length > 0) {
              for (const msg of messages) {
                const contentResult = calculateMatchScore(msg.text, query);
                if (contentResult.score > 0) {
                  contentMatches.push({
                    chat,
                    score: contentResult.score,
                    matchedSnippet: contentResult.matchedSnippet,
                  });
                  break;
                }
              }
            }
          }

          titleMatches.sort((a, b) => b.score - a.score);
          contentMatches.sort((a, b) => b.score - a.score);

          filteredChats = [...titleMatches, ...contentMatches];
        }

        filteredChats.forEach(({ chat, matchedSnippet }) => {
          const chatDate = chat.createdAt
            ? new Date(chat.createdAt)
            : new Date();
          if (chatDate >= today) {
            groups.today.push({ chat, matchedSnippet });
          } else {
            groups.older.push({ chat, matchedSnippet });
          }
        });

        return groups;
      } catch (error) {
        console.error("Ошибка при группировке чатов:", error);
        return { today: [], older: [] };
      }
    },
  };
};
