import { supabase } from "../../utils/supabase";
import { ModelService } from "../../services/ModelService";
import { useChatHistoryStore } from "../../stores/chatHistory";
import { generateTitle } from "../../utils/api";
import { Message } from "../../types";
import { useMessageStore } from "../../stores/messageStore";
import useToast from "../../hooks/useToast";

export const useSendMessage = () => {
  const toast = useToast();
  const { setMessages, messages, setIsTyping } = useMessageStore();
  const { updateLastMessage, selectChat } = useChatHistoryStore();

  const sendMessage = async (
    activeChat: { id: number; title: string } | undefined,
    content: string,
    selectedModel: "deepseek" | "maverick" | "claude" | "gpt4o",
    imageUrl: string | null | undefined,
    thinkMode: boolean
  ) => {
    if (!activeChat || (!content.trim() && !imageUrl)) return;

    const normalizedImageUrl = imageUrl ?? undefined;
    const messageContent = content || (imageUrl ? "Describe this image" : "");

    const messageId = `user-${activeChat.id}-${Date.now()}`;

    const newUserMessage: Message = {
      id: messageId,
      text: messageContent,
      sender: "user",
      imageUrl: normalizedImageUrl,
    };
    setMessages([...messages, newUserMessage]);
    setIsTyping(true);

    try {
      const { error: userMsgError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: activeChat.id,
          role: "user",
          content: messageContent,
        });

      if (userMsgError) {
        console.error("Ошибка сохранения сообщения:", userMsgError);
      }

      await updateLastMessage(activeChat.id, messageContent);

      const response = await ModelService.sendMessage(
        activeChat.id,
        messageContent,
        selectedModel,
        normalizedImageUrl,
        thinkMode
      );

      if (!response.success && response.error) {
        toast.error(response.error);
      } else if (response.message) {
        const assistantMessage: Message = {
          id: `${activeChat.id}-${Date.now() + 1}`,
          text: response.message,
          sender: "assistant",
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const { error: assistantMsgError } = await supabase
          .from("chat_messages")
          .insert({
            chat_id: activeChat.id,
            role: "assistant",
            content: response.message,
          });

        if (assistantMsgError) {
          console.error("Ошибка сохранения ответа:", assistantMsgError);
        }

        await updateLastMessage(activeChat.id, response.message);

        if (activeChat.title === "Новый чат") {
          try {
            const title = await generateTitle([
              messageContent,
              response.message,
            ]);
            if (title && title !== "Новый чат") {
              await useChatHistoryStore
                .getState()
                .renameChat(activeChat.id, title);
            }
          } catch {}
        }
      }
    } catch {
      toast.error("Ошибка сети или сервера. Попробуйте позже.");
    } finally {
      setIsTyping(false);
      if (activeChat) await selectChat(activeChat.id);
    }
  };

  return {
    sendMessage,
  };
};
