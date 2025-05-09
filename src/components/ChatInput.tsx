import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessageStore } from "../stores/messageStore";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useChatHistoryStore } from "../stores/chatHistoryStore";
import { ModelService } from "../services/ModelService";
import Button from "./ui/Button";
import Toast from "./ui/Toast";
import { Message } from "../types";
import Image from "next/image";
import { supabase } from "../utils/supabase";
import CustomDropup from "./ui/CustomDropup";
import { generateTitle } from "../utils/api";

const ChatInput: React.FC = () => {
  const {
    inputMessage,
    setInputMessage,
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    setInputFieldRef,
    handleKeyPress,
  } = useMessageStore();
  const { isListening, toggleListening, transcript } = useVoiceInput();
  const { chatHistory, selectChat, updateLastMessage } = useChatHistoryStore();
  const activeChat = chatHistory.find((chat) => chat.isActive);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedModel, setSelectedModel] = useState<
    "deepseek" | "maverick" | "claude" | "gpt4o"
  >("gpt4o");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thinkMode, setThinkMode] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

  useEffect(() => {
    setInputFieldRef(textareaRef);
  }, [setInputFieldRef]);

  useEffect(() => {
    if (transcript) setInputMessage(transcript);
  }, [transcript, setInputMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharCount(inputMessage.length);
  }, [inputMessage]);

  const handleSend = async () => {
    if (!activeChat || (!inputMessage.trim() && !imageUrl)) return;
  
    const normalizedImageUrl = imageUrl ?? undefined;
    const content = inputMessage || (imageUrl ? "Describe this image" : "");
    
    const messageId = `user-${activeChat.id}-${Date.now()}`;

    const newUserMessage: Message = {
      id: messageId,
      text: content,
      sender: "user",
      imageUrl: normalizedImageUrl,
    };
    setMessages([...messages, newUserMessage]);

    setInputMessage("");
    setImageUrl(null);
    setIsTyping(true);

    const { error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: activeChat.id,
        role: "user",
        content,
      });
    if (userMsgError)
      console.error("Ошибка сохранения сообщения:", userMsgError);

    await updateLastMessage(activeChat.id, content);

    try {
      const response = await ModelService.sendMessage(
        activeChat.id,
        content,
        selectedModel,
        normalizedImageUrl,
        thinkMode
      );
      if (!response.success && response.error) {
        setToast({ message: response.error, type: "error" });
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
        if (assistantMsgError)
          console.error("Ошибка сохранения ответа:", assistantMsgError);

        await updateLastMessage(activeChat.id, response.message);

        if (activeChat.title === "Новый чат") {
          try {
            const title = await generateTitle([content, response.message]);
            if (title && title !== "Новый чат") {
              await useChatHistoryStore
                .getState()
                .renameChat(activeChat.id, title);
            }
          } catch {}
        }
      }
    } catch {
      setToast({
        message: "Ошибка сети или сервера. Попробуйте позже.",
        type: "error",
      });
    } finally {
      setIsTyping(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      if (activeChat) await selectChat(activeChat.id);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String);
      };
      reader.onerror = () => {
        setToast({ message: "Ошибка при чтении изображения", type: "error" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

  const showCharCounter = charCount > 0 && charCount > 80;

  return (
    <div className="sticky bottom-0 p-4 transition-all duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div
        className={`max-w-3xl mx-auto relative ${
          isFocused ? "scale-101" : "scale-100"
        } transition-transform duration-300`}
      >
        <div className="w-full border border-gray-500 rounded-lg bg-gray-800 p-2 flex flex-col">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              handleKeyPress(e);
              if (e.key === "Enter" && !e.shiftKey) {
                handleSend();
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Нажмите Enter для отправки, Shift+Enter для новой строки."
            className={`w-full py-1 bg-transparent text-gray-100 border-0 focus:ring-0 outline-none resize-none text-base mb-2`}
            rows={1}
            disabled={isTyping}
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center mt-auto">
              <CustomDropup
                value={selectedModel}
                onChange={(value) => setSelectedModel(value)}
                className="mr-2"
              />
              <Button
                onClick={() => setThinkMode(!thinkMode)}
                className={`p-2 rounded-full ${
                  thinkMode
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    : "bg-gray-700 hover:bg-gray-600"
                } text-white mr-2`}
              >
                <FontAwesomeIcon icon="brain" />
              </Button>
              {!imageUrl && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="p-2 rounded-full text-gray-400 hover:text-gray-200 cursor-pointer mr-2"
                  >
                    <FontAwesomeIcon icon="image" size="lg" />
                  </label>
                </>
              )}
              {imageUrl && (
                <div className="flex items-center relative mr-2">
                  <Image
                    src={imageUrl}
                    alt="Attached"
                    className="w-8 h-8 object-cover rounded"
                    width={32}
                    height={32}
                  />
                  <Button
                    onClick={handleRemoveImage}
                    className="absolute -top-4 right-4 bg-transparent hover:bg-transparent hover:text-red-500 text-gray-400 border-none"
                  >
                    <FontAwesomeIcon icon="times" size="sm" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {showCharCounter && (
                <div
                  className={`text-xs ${
                    charCount > 1500 ? "text-orange-500" : "text-gray-400"
                  } mr-2`}
                >
                  {charCount}/2000
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center gap-2">
                <Button
                  onClick={toggleListening}
                  className={`p-2 rounded-full ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  } text-white`}
                >
                  <FontAwesomeIcon icon="microphone" />
                </Button>
                <Button
                  onClick={handleSend}
                  className={`p-2 w-11 rounded-full ${
                    imageUrl || inputMessage.trim()
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                      : "bg-gray-700"
                  } text-white`}
                  disabled={(!imageUrl && !inputMessage.trim()) || isTyping}
                >
                  <FontAwesomeIcon icon="paper-plane" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-sm text-gray-500 text-center transition-opacity duration-200 hover:text-gray-400">
          CoolStory может допускать ошибки. Проверьте важную информацию.
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
