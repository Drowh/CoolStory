import DOMPurify from "dompurify";

const MAX_TITLE_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 10;
const MAX_WORDS = 4;

const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text.trim());
};

const validateMessages = (messages: string[]): string[] => {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  if (messages.length > MAX_MESSAGES) {
    throw new Error(`Too many messages. Maximum is ${MAX_MESSAGES}`);
  }

  return messages.map((msg) => {
    if (typeof msg !== "string") {
      throw new Error("All messages must be strings");
    }
    if (msg.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message too long. Maximum is ${MAX_MESSAGE_LENGTH} characters`
      );
    }
    return sanitizeText(msg);
  });
};

export async function generateTitle(messages: string[]): Promise<string> {
  try {
    if (!messages?.length) return "Новый чат";

    const validMessages = validateMessages(messages);
    const text = validMessages.join(" ");
    const words = text.split(/\s+/).filter(Boolean);

    if (!words.length) return "Новый чат";

    const short = words.slice(0, MAX_WORDS).join(" ");
    const title = words.length > MAX_WORDS ? `${short}...` : short;

    return title.length > MAX_TITLE_LENGTH
      ? `${title.slice(0, MAX_TITLE_LENGTH - 3)}...`
      : title;
  } catch (error) {
    console.error("Error generating title:", error);
    return "Новый чат";
  }
}
