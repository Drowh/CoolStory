import React from "react";

interface EmptyChatProps {
  focusInputField: () => void;
}

const EmptyChat: React.FC<EmptyChatProps> = ({ focusInputField }) => {
  return (
    <div
      onClick={focusInputField}
      className="flex flex-col cursor-pointer items-center justify-center h-64 text-zinc-500 dark:text-gray-500 transition-all duration-500"
    >
      <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-zinc-100 dark:border-gray-700 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
        <p className="mb-2 text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
          Начните ваш диалог
        </p>
        <p className="text-sm text-zinc-500 dark:text-gray-500">
          Задайте мне вопрос, и я постараюсь помочь
        </p>
      </div>
    </div>
  );
};

export default EmptyChat;
