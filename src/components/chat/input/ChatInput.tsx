import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "../../../stores/messageStore";
import { useVoiceInput } from "../../../hooks/useVoiceInput";
import { useChatHistoryStore } from "../../../stores/chatHistory";
import ChatInputToolbar from "./ChatInputToolbar";
import ChatInputActions from "./ChatInputActions";
import { useSendMessage } from "../../../hooks/chat/useSendMessage";
import { useImageUpload } from "../../../hooks/chat/useImageUpload";

const ChatInput: React.FC = () => {
  const {
    inputMessage,
    setInputMessage,
    setInputFieldRef,
    handleKeyPress,
    isTyping,
  } = useMessageStore();
  const { isListening, toggleListening, transcript, speechLevel } =
    useVoiceInput();
  const { chatHistory } = useChatHistoryStore();
  const activeChat = chatHistory.find((chat) => chat.isActive);

  const { sendMessage } = useSendMessage();
  const { imageUrl, handleImageUpload, handleRemoveImage } = useImageUpload();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [selectedModel, setSelectedModel] = useState<
    "deepseek" | "maverick" | "claude" | "gpt4o"
  >("gpt4o");
  const [thinkMode, setThinkMode] = useState(false);
  const [baseMessage, setBaseMessage] = useState("");

  useEffect(() => {
    setInputFieldRef(textareaRef);
  }, [setInputFieldRef]);

  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  useEffect(() => {
    if (isListening) {
      const separator = baseMessage.trim() ? ". " : "";
      const capitalizedTranscript = capitalizeFirstLetter(transcript);
      setInputMessage(baseMessage + separator + capitalizedTranscript);
    }
  }, [transcript, isListening, baseMessage, setInputMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
    setCharCount(inputMessage.length);
  }, [inputMessage]);

  const handleSend = async () => {
    if (!activeChat) return;

    await sendMessage(
      activeChat,
      inputMessage,
      selectedModel,
      imageUrl,
      thinkMode
    );

    setInputMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleToggleListening = useCallback(() => {
    if (!isListening) {
      setBaseMessage(inputMessage);
    }
    toggleListening();
  }, [isListening, inputMessage, toggleListening]);

  const showCharCounter = charCount > 0 && charCount > 80;
  const canSend = !!imageUrl || !!inputMessage.trim();

  const containerClass = isFocused ? "input-gradient-border" : "";

  return (
    <div className="sticky bottom-0 px-4 transition-all duration-300">
      <div
        className={`max-w-3xl mx-auto relative ${
          isFocused ? "scale-101" : "scale-100"
        } transition-transform duration-300`}
      >
        <div
          className={`w-full border border-gray-500 rounded-lg bg-gray-800 p-2 flex flex-col transition-colors duration-200 ${containerClass}`}
        >
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => {
              if (!isListening) {
                setInputMessage(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              handleKeyPress(e);
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
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
            <ChatInputToolbar
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              thinkMode={thinkMode}
              setThinkMode={setThinkMode}
              imageUrl={imageUrl}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
            />
            <ChatInputActions
              charCount={charCount}
              showCharCounter={showCharCounter}
              isListening={isListening}
              toggleListening={handleToggleListening}
              canSend={canSend}
              isTyping={isTyping}
              onSend={handleSend}
              speechLevel={speechLevel}
            />
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
