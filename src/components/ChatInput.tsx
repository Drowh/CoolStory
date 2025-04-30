import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMessageStore } from "../stores/messageStore";
import { useVoiceInput } from "../hooks/useVoiceInput";
import Button from "./ui/Button";

const ChatInput: React.FC = () => {
  const {
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleKeyPress,
    isTyping,
  } = useMessageStore();
  const { isListening, toggleListening, transcript } = useVoiceInput();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

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

  const handleSend = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    handleSendMessage();
  };

  const showCharCounter = charCount > 0 && charCount > 80;

  return (
    <div className="sticky bottom-0 p-4 transition-all duration-300">
      <div
        className={`max-w-3xl mx-auto relative ${
          isFocused ? "scale-101" : "scale-100"
        } transition-transform duration-300`}
      >
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Введите ваше сообщение..."
          className={`w-full bg-gray-800 text-gray-100 rounded-lg border ${
            isFocused
              ? "border-pink-500 shadow-md shadow-pink-500/20"
              : "border-gray-500"
          } focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none p-3 pr-16 resize-none text-base transition-all duration-200`}
          rows={2}
          disabled={isTyping}
          maxLength={2000}
        />

        {/* Счетчик символов */}
        {showCharCounter && (
          <div
            className={`absolute right-16 bottom-3 text-xs ${
              charCount > 1500 ? "text-orange-500" : "text-gray-400"
            }`}
          >
            {charCount}/2000
          </div>
        )}

        <div className="absolute right-3 bottom-3 flex space-x-2">
          <Button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isListening
                ? "text-red-500 bg-gray-700 animate-pulse"
                : "text-gray-400 hover:text-gray-200"
            }`}
            aria-label={isListening ? "Остановить запись" : "Начать запись"}
          >
            <FontAwesomeIcon
              icon={isListening ? "microphone-slash" : "microphone"}
              className={isListening ? "animate-bounce" : ""}
            />
          </Button>
          <Button
            onClick={handleSend}
            className={`p-2 rounded-full ${
              inputMessage.trim()
                ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                : "bg-gray-700"
            } text-white transform transition-all duration-200 ${
              inputMessage.trim() ? "hover:scale-105" : ""
            }`}
            disabled={!inputMessage.trim() || isTyping}
            aria-label="Отправить сообщение"
          >
            <FontAwesomeIcon icon="paper-plane" />
          </Button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-2 text-sm text-gray-500 text-center transition-opacity duration-200 hover:text-gray-400">
        Нажмите Enter для отправки, Shift+Enter для новой строки
      </div>
    </div>
  );
};

export default ChatInput;
