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
    className={`p-2 w-11 rounded-full ${
      canSend
        ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
        : "bg-gray-700"
    } text-white`}
    disabled={!canSend || isTyping}
    aria-label="Отправить сообщение"
  >
    <FontAwesomeIcon icon="paper-plane" />
  </Button>
);

export default SendButton; 