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

const messageCache = new Map<
  number,
  {
    promise: Promise<Message[]>;
    timestamp: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000;

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of messageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      messageCache.delete(key);
    }
  }
};

setInterval(cleanupCache, CACHE_TTL);

export const ModelService = {
  async sendMessage(
    chatId: number,
    userMessage: string,
    model: "deepseek" | "maverick" | "claude" | "gpt4o",
    imageUrl?: string,
    thinkMode?: boolean
  ): Promise<ModelServiceResponse> {
    try {
      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: userMessage,
          model,
          imageUrl,
          thinkMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Неизвестная ошибка");
      }

      messageCache.delete(chatId);

      return { success: true, message: data.message };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async loadMessages(chatId: number): Promise<Message[]> {
    const cached = messageCache.get(chatId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.promise;
    }

    const requestPromise = (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const response = await fetch(`/api/loadMessages?chatId=${chatId}`);
        const { data, error } = await response.json();

        if (error) {
          console.error("Ошибка загрузки сообщений:", error);
          return [];
        }

        const uniqueMessages: Message[] = [];
        const messageSet = new Set();

        for (const msg of data) {
          const key = `${msg.role}:${msg.content}`;
          if (!messageSet.has(key)) {
            messageSet.add(key);
            uniqueMessages.push({
              role: msg.role as "user" | "assistant",
              content: msg.content,
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
        messageCache.delete(chatId);
        return [];
      }
    })();

    messageCache.set(chatId, {
      promise: requestPromise,
      timestamp: Date.now(),
    });

    return requestPromise;
  },
};
