import React from "react";

interface EmptyChatProps {
  focusInputField: () => void;
}

const EmptyChat: React.FC<EmptyChatProps> = ({ focusInputField }) => {
  return (
    <div
      onClick={focusInputField}
      className="flex flex-col cursor-pointer items-center justify-center h-64 text-gray-500 transition-all duration-500 transform hover:scale-105"
    >
      <div className="p-6 rounded-lg bg-gray-800 bg-opacity-40 shadow-lg transform hover:shadow-pink-500/10 transition-all duration-300">
        <p className="mb-2 text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
          Начните ваш диалог
        </p>
        <p className="text-sm text-gray-500">
          Задайте мне вопрос, и я постараюсь помочь
        </p>
      </div>
    </div>
  );
};

export default EmptyChat;
