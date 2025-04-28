import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (transcript) setInputMessage(transcript);
  }, [transcript, setInputMessage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-900">
      <div className="max-w-3xl mx-auto relative">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Введите ваше сообщение..."
          className="w-full bg-gray-800 text-gray-100 rounded-lg border border-gray-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none p-3 pr-12 resize-none text-base"
          rows={2}
          disabled={isTyping}
        />
        <div className="absolute right-3 bottom-3 flex space-x-2">
          <Button
            onClick={toggleListening}
            className={`p-2 rounded-full ${
              isListening ? "text-red-500" : "text-gray-400 hover:text-gray-200"
            }`}
            aria-label={isListening ? "Остановить запись" : "Начать запись"}
          >
            <FontAwesomeIcon
              icon={isListening ? "microphone-slash" : "microphone"}
            />
          </Button>
          <Button
            onClick={handleSendMessage}
            className="p-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white"
            disabled={isTyping}
            aria-label="Отправить сообщение"
          >
            <FontAwesomeIcon icon="paper-plane" />
          </Button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-2 text-sm text-gray-500 text-center">
        Нажмите Enter для отправки, Shift+Enter для новой строки
      </div>
    </div>
  );
};

export default ChatInput;
