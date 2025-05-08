interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ModelServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

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

      return { success: true, message: data.message };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  async loadMessages(chatId: number): Promise<Message[]> {
    const response = await fetch(`/api/loadMessages?chatId=${chatId}`);
    const { data, error } = await response.json();

    if (error) {
      console.error("Ошибка загрузки сообщений:", error);
      return [];
    }

    return data.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  },
};
