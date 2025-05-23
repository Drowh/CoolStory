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
      <div
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        {[1, 2, 3].map((i) => {
          const scale = 1 + Math.min(speechLevel / 100, 1) * 0.4;
          return (
            <div
              key={i}
              className={`absolute rounded-full bg-pink-500/20 dark:bg-pink-400/20 animate-pulse-wave`}
              style={{
                width: "100%",
                height: "100%",
                transform: `scale(${scale * i * 0.3})`,
                animationDuration: `${0.8 + i * 0.2}s`,
                animationDelay: `${i * 0.15}s`,
                opacity: isListening ? 0.8 - i * 0.2 : 0,
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
        className={`p-2 rounded-full relative z-10 transition-all duration-200 ${
          isListening
            ? "hover:bg-red-700"
            : "bg-zinc-100 hover:bg-zinc-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        } text-white dark:text-white shadow-sm hover:shadow-md`}
        style={isListening ? { backgroundColor: "#dc2626" } : {}}
        aria-label={
          isListening ? "Остановить запись голоса" : "Начать запись голоса"
        }
      >
        <FontAwesomeIcon icon="microphone" aria-hidden="true" />
        {isListening && (
          <span
            className="absolute -top-1 -right-1 flex h-3 w-3"
            aria-hidden="true"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        )}
      </Button>
    </div>
  );
};

export default MicrophoneButton;
