import React from "react";
import { CharCounter, MicrophoneButton, SendButton } from "./components";

interface ChatInputActionsProps {
  charCount: number;
  showCharCounter: boolean;
  isListening: boolean;
  toggleListening: () => void;
  canSend: boolean;
  isTyping: boolean;
  onSend: () => void;
  speechLevel?: number;
}

const ChatInputActions: React.FC<ChatInputActionsProps> = ({
  charCount,
  showCharCounter,
  isListening,
  toggleListening,
  canSend,
  isTyping,
  onSend,
  speechLevel = 0,
}) => {
  return (
    <div
      className="flex items-center"
      role="group"
      aria-label="Действия с сообщением"
    >
      {showCharCounter && (
        <CharCounter
          count={charCount}
          maxCount={2000}
          warningThreshold={1500}
        />
      )}

      <div
        className="flex items-end sm:items-center gap-2"
        role="group"
        aria-label="Кнопки управления"
      >
        <MicrophoneButton
          isListening={isListening}
          onClick={toggleListening}
          speechLevel={speechLevel}
          aria-label={
            isListening ? "Остановить запись голоса" : "Начать запись голоса"
          }
          aria-pressed={isListening}
        />
        <SendButton
          canSend={canSend}
          isTyping={isTyping}
          onClick={onSend}
          aria-label={
            isTyping ? "Отправка сообщения..." : "Отправить сообщение"
          }
          aria-disabled={!canSend || isTyping}
        />
      </div>
    </div>
  );
};

export default ChatInputActions;
