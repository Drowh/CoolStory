import { Chat, Message } from "../types";
import DOMPurify from "dompurify";

const MAX_TITLE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES = 1000;
const MAX_FILENAME_LENGTH = 100 as const;

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text.trim());
};

const validateChat = (chat: Chat): void => {
  if (!chat || typeof chat !== "object") {
    throw new Error("Некорректные данные чата");
  }
  if (!chat.id) {
    throw new Error("Некорректный ID чата");
  }
  if (chat.title && typeof chat.title !== "string") {
    throw new Error("Некорректный заголовок чата");
  }
};

const validateMessages = (messages: Message[]): void => {
  if (!Array.isArray(messages)) {
    throw new Error("Некорректный формат сообщений");
  }
  if (messages.length > MAX_MESSAGES) {
    throw new Error(
      `Превышено максимальное количество сообщений: ${MAX_MESSAGES}`
    );
  }
  messages.forEach((msg, index) => {
    if (!msg || typeof msg !== "object") {
      throw new Error(`Некорректное сообщение #${index + 1}`);
    }
    if (typeof msg.text !== "string") {
      throw new Error(`Некорректный текст сообщения #${index + 1}`);
    }
    if (typeof msg.sender !== "string") {
      throw new Error(`Некорректный отправитель сообщения #${index + 1}`);
    }
    if (msg.text.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Превышена максимальная длина сообщения #${index + 1}`);
    }
  });
};

const createSafeFilename = (chatId: string | number): string => {
  const safeId = String(chatId).replace(/[^a-zA-Z0-9-_]/g, "");
  const date = new Date().toISOString().split("T")[0];
  const filename = `chat-${safeId}-${date}.json`;
  return filename.slice(0, MAX_FILENAME_LENGTH);
};

export const exportChat = (chat: Chat, messages: Message[]): void => {
  let url: string | null = null;
  let link: HTMLAnchorElement | null = null;

  try {
    validateChat(chat);
    validateMessages(messages);

    const exportData = {
      chatInfo: {
        id: chat.id,
        title: sanitizeText(String(chat.title || "")).slice(
          0,
          MAX_TITLE_LENGTH
        ),
      },
      messages: messages
        .filter((msg) => typeof msg.text === "string" && msg.text.trim() !== "")
        .map((msg) => ({
          text: sanitizeText(String(msg.text)),
          sender: sanitizeText(String(msg.sender)),
        })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = createSafeFilename(String(chat.id));
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("Ошибка при экспорте чата:", error);
    throw new Error(
      error instanceof Error ? error.message : "Не удалось экспортировать чат"
    );
  } finally {
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
};
