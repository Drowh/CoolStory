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
}

const ChatInputActions: React.FC<ChatInputActionsProps> = ({
  charCount,
  showCharCounter,
  isListening,
  toggleListening,
  canSend,
  isTyping,
  onSend,
}) => {
  return (
    <div className="flex items-center">
      {showCharCounter && (
        <CharCounter
          count={charCount}
          maxCount={2000}
          warningThreshold={1500}
        />
      )}

      <div className="flex items-end sm:items-center gap-2">
        <MicrophoneButton isListening={isListening} onClick={toggleListening} />
        <SendButton canSend={canSend} isTyping={isTyping} onClick={onSend} />
      </div>
    </div>
  );
};

export default ChatInputActions;
