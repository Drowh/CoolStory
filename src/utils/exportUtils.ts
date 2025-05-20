import { Chat, Message } from "../types";

export const exportChat = (chat: Chat, messages: Message[]): void => {
  try {
    const exportData = {
      chatInfo: {
        id: chat.id,
        title: chat.title,
      },
      messages: messages.map((msg) => ({
        text: msg.text,
        sender: msg.sender,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-${chat.id}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при экспорте чата:", error);
    throw new Error("Не удалось экспортировать чат");
  }
};
