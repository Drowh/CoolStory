import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";

interface MicrophoneButtonProps {
  isListening: boolean;
  onClick: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  onClick,
}) => (
  <Button
    onClick={onClick}
    className={`p-2 rounded-full ${
      isListening
        ? "bg-red-600 hover:bg-red-700"
        : "bg-gray-700 hover:bg-gray-600"
    } text-white`}
    aria-label={isListening ? "Остановить запись" : "Начать запись"}
  >
    <FontAwesomeIcon icon="microphone" />
  </Button>
);

export default MicrophoneButton;
