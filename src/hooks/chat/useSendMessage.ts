import { supabase } from "../../utils/supabase";
import { ModelService } from "../../services/ModelService";
import { useChatHistoryStore } from "../../stores/chatHistory";
import { generateTitle } from "../../utils/api";
import { Message } from "../../types";
import { useMessageStore } from "../../stores/messageStore";
import useToast from "../../hooks/useToast";
import { useRef } from "react";

type ModelType = "deepseek" | "maverick" | "claude" | "gpt4o";
type ChatType = { id: number; title: string };

interface ModelResponse {
  success: boolean;
  error?: string;
  message?: string;
}

interface SupabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

const validateInput = (
  content: string,
  imageUrl: string | null | undefined
): boolean => {
  if (!content && !imageUrl) return false;
  if (content && content.length > 10000) return false;

  if (imageUrl) {
    try {
      const url = new URL(imageUrl);
      const validProtocols = ["http:", "https:", "data:"];
      return validProtocols.includes(url.protocol);
    } catch {
      return false;
    }
  }

  return true;
};

const API_TIMEOUT = 30000;

export const useSendMessage = () => {
  const toast = useToast();
  const { setMessages, setIsTyping } = useMessageStore();
  const { updateLastMessage, selectChat } = useChatHistoryStore();
  const isSendingRef = useRef(false);

  const sendMessage = async (
    activeChat: ChatType | undefined,
    content: string,
    selectedModel: ModelType,
    imageUrl: string | null | undefined,
    thinkMode: boolean
  ) => {
    if (isSendingRef.current) {
      toast.error("Подождите, сообщение отправляется");
      return;
    }

    if (!activeChat) {
      toast.error("Чат не выбран");
      return;
    }

    if (!validateInput(content, imageUrl)) {
      if (content && content.length > 10000) {
        toast.error("Сообщение слишком длинное");
      } else if (imageUrl) {
        toast.error("Некорректный формат URL изображения");
      } else {
        toast.error("Сообщение не может быть пустым");
      }
      return;
    }

    isSendingRef.current = true;
    const normalizedImageUrl = imageUrl ?? undefined;
    const messageContent = content || (imageUrl ? "Опиши изображение" : "");
    const messageId = `user-${activeChat.id}-${Date.now()}`;

    const newUserMessage: Message = {
      id: messageId,
      text: messageContent,
      sender: "user",
      imageUrl: normalizedImageUrl,
    };

    try {
      setMessages((prev) => [...prev, newUserMessage]);
      setIsTyping(true);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Превышено время ожидания")),
          API_TIMEOUT
        );
      });

      const { error: userMsgError } = (await Promise.race([
        supabase.from("chat_messages").insert({
          chat_id: activeChat.id,
          role: "user",
          content: messageContent,
        }),
        timeoutPromise,
      ])) as SupabaseResponse<unknown>;

      if (userMsgError) {
        throw new Error(`Ошибка сохранения сообщения: ${userMsgError.message}`);
      }

      await updateLastMessage(activeChat.id, messageContent);

      const response = (await Promise.race([
        ModelService.sendMessage(
          activeChat.id,
          messageContent,
          selectedModel,
          normalizedImageUrl,
          thinkMode
        ),
        timeoutPromise,
      ])) as ModelResponse;

      if (!response.success && response.error) {
        throw new Error(response.error);
      }

      if (response.message) {
        const assistantMessage: Message = {
          id: `${activeChat.id}-${Date.now() + 1}`,
          text: response.message,
          sender: "assistant",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        const { error: assistantMsgError } = (await Promise.race([
          supabase.from("chat_messages").insert({
            chat_id: activeChat.id,
            role: "assistant",
            content: response.message,
          }),
          timeoutPromise,
        ])) as SupabaseResponse<unknown>;

        if (assistantMsgError) {
          throw new Error(
            `Ошибка сохранения ответа: ${assistantMsgError.message}`
          );
        }

        await updateLastMessage(activeChat.id, response.message);

        if (activeChat.title === "Новый чат") {
          try {
            const title = (await Promise.race([
              generateTitle([messageContent, response.message]),
              timeoutPromise,
            ])) as string | null;

            if (title && title !== "Новый чат") {
              await useChatHistoryStore
                .getState()
                .renameChat(activeChat.id, title);
            }
          } catch (error) {
            console.error("Ошибка генерации заголовка:", error);
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка сети или сервера. Попробуйте позже."
      );
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
      if (activeChat) await selectChat(activeChat.id);
    }
  };

  return {
    sendMessage,
  };
};
