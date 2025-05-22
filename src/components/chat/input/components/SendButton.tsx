import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";

interface SendButtonProps {
  canSend: boolean;
  isTyping: boolean;
  onClick: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({
  canSend,
  isTyping,
  onClick,
}) => (
  <Button
    onClick={onClick}
    className={`p-2 w-11 rounded-full transition-all duration-200 ${
      canSend
        ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-sm hover:shadow-md"
        : "bg-zinc-100 dark:bg-gray-700 text-zinc-400 dark:text-gray-500"
    }`}
    disabled={!canSend || isTyping}
    aria-label="Отправить сообщение"
  >
    <FontAwesomeIcon icon="paper-plane" />
  </Button>
);

export default SendButton;
