import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";

interface MicrophoneButtonProps {
  isListening: boolean;
  onClick: () => void;
  speechLevel?: number;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  onClick,
  speechLevel = 0,
}) => {
  const generateWaveCircles = () => {
    if (!isListening) return null;

    return (
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => {
          const scale = 1 + Math.min(speechLevel / 100, 1) * 0.5;
          return (
            <div
              key={i}
              className={`absolute rounded-full bg-red-600/20 animate-pulse-wave`}
              style={{
                width: "100%",
                height: "100%",
                transform: `scale(${scale * i * 0.4})`,
                animationDelay: `${i * 0.2}s`,
                opacity: isListening ? 0.7 - i * 0.2 : 0,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex items-center gap-2">
      {generateWaveCircles()}
      <Button
        onClick={onClick}
        className={`p-2 rounded-full relative z-10 ${
          isListening
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-700 hover:bg-gray-600"
        } text-white`}
        aria-label={isListening ? "Остановить запись" : "Начать запись"}
      >
        <FontAwesomeIcon icon="microphone" />
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>
    </div>
  );
};

export default MicrophoneButton;
