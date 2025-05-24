import DOMPurify from "dompurify";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
}

interface ModelServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

type ModelType = "deepseek" | "maverick" | "claude" | "gpt4o";

interface CacheEntry {
  promise: Promise<Message[]>;
  timestamp: number;
  retryCount: number;
}

const messageCache = new Map<
  number,
  {
    promise: Promise<Message[]>;
    timestamp: number;
    retryCount: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_CACHE_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 30000;
const MAX_CHAT_ID = 1000000;

let currentActiveChatId: number | null = null;

export const setCurrentActiveChatId = (chatId: number | null) => {
  if (currentActiveChatId !== chatId) {
    messageCache.clear();
  }
  currentActiveChatId = chatId;
};

const sanitizeMessage = (message: string): string => {
  return DOMPurify.sanitize(message.trim());
};

const validateInput = (
  chatId: number,
  userMessage: string,
  model: ModelType,
  imageUrl?: string
): string | null => {
  if (!Number.isInteger(chatId) || chatId <= 0 || chatId > MAX_CHAT_ID) {
    return "Некорректный ID чата";
  }
  if (!userMessage || typeof userMessage !== "string") {
    return "Некорректное сообщение";
  }
  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return `Сообщение слишком длинное. Максимальная длина: ${MAX_MESSAGE_LENGTH}`;
  }
  if (imageUrl && typeof imageUrl === "string") {
    try {
      const url = new URL(imageUrl);
      if (!["http:", "https:", "data:"].includes(url.protocol)) {
        return "Некорректный протокол URL изображения";
      }
    } catch {
      return "Некорректный URL изображения";
    }
  }
  return null;
};

const cleanupCache = () => {
  const now = Date.now();
  const entries = Array.from(messageCache.entries());

  if (entries.length > MAX_CACHE_SIZE) {
    entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, entries.length - MAX_CACHE_SIZE)
      .forEach(([key]) => messageCache.delete(key));
  }

  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_TTL) {
      messageCache.delete(key);
    }
  }
};

setInterval(cleanupCache, CACHE_TTL);

const handleRequestError = (error: unknown): ModelServiceResponse => {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return { success: false, error: "Превышено время ожидания" };
    }
    return { success: false, error: error.message };
  }
  return { success: false, error: "Неизвестная ошибка" };
};

export const ModelService = {
  async sendMessage(
    chatId: number,
    userMessage: string,
    model: ModelType,
    imageUrl?: string,
    thinkMode?: boolean
  ): Promise<ModelServiceResponse> {
    const validationError = validateInput(chatId, userMessage, model, imageUrl);
    if (validationError) {
      return { success: false, error: validationError };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: sanitizeMessage(userMessage),
          model,
          imageUrl,
          thinkMode,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Неизвестная ошибка");
      }

      messageCache.delete(chatId);

      return { success: true, message: sanitizeMessage(data.message) };
    } catch (error) {
      return handleRequestError(error);
    }
  },

  async loadMessages(chatId: number): Promise<Message[]> {
    if (!Number.isInteger(chatId) || chatId <= 0 || chatId > MAX_CHAT_ID) {
      console.error("Некорректный ID чата:", chatId);
      return [];
    }

    if (currentActiveChatId !== chatId) {
      console.log("Активный чат изменился, отменяем загрузку");
      return [];
    }

    const cached = messageCache.get(chatId);
    if (
      cached &&
      Date.now() - cached.timestamp < CACHE_TTL &&
      cached.retryCount < MAX_RETRIES
    ) {
      return cached.promise;
    }

    const requestPromise = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const response = await fetch(`/api/loadMessages?chatId=${chatId}`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.statusText}`);
        }

        const { data, error } = await response.json();

        if (error) {
          throw new Error(error);
        }

        if (currentActiveChatId !== chatId) {
          console.log("Активный чат изменился во время загрузки");
          return [];
        }

        const uniqueMessages: Message[] = [];
        const messageSet = new Set<string>();

        for (const msg of data) {
          if (!msg || typeof msg !== "object") continue;

          const role = msg.role as "user" | "assistant" | "system";
          const content = sanitizeMessage(msg.content);
          const key = `${role}:${content}`;

          if (!messageSet.has(key)) {
            messageSet.add(key);
            uniqueMessages.push({
              role,
              content,
              id: msg.id || `${chatId}-${uniqueMessages.length}`,
            });
          }
        }

        return uniqueMessages;
      } catch (error) {
        console.error(
          `Ошибка при загрузке сообщений для chatId=${chatId}:`,
          error
        );

        if (currentActiveChatId !== chatId) {
          console.log("Активный чат изменился во время ошибки");
          return [];
        }

        const cached = messageCache.get(chatId);
        if (
          cached &&
          cached.retryCount < MAX_RETRIES &&
          currentActiveChatId === chatId
        ) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          messageCache.set(chatId, {
            ...cached,
            retryCount: cached.retryCount + 1,
            timestamp: Date.now(),
          });
          return ModelService.loadMessages(chatId);
        }

        messageCache.delete(chatId);
        return [];
      }
    })();

    messageCache.set(chatId, {
      promise: requestPromise,
      timestamp: Date.now(),
      retryCount: 0,
    });

    return requestPromise;
  },
};
