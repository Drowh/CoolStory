import React from "react";

interface WelcomeScreenProps {
  openAuthModal: () => void;
  isAuthenticated?: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  openAuthModal,
  isAuthenticated = false,
}) => {
  return (
    <div className="flex-1 mt-6 mx-2 flex flex-col items-center justify-center text-zinc-600 dark:text-gray-400 transition-all duration-500">
      <div
        onClick={isAuthenticated ? undefined : openAuthModal}
        className={`p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-zinc-100 dark:border-gray-700 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-md max-w-md w-full mx-4 backdrop-blur-sm ${
          !isAuthenticated ? "cursor-pointer" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4 text-zinc-400 dark:text-gray-600 animate-float"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-center text-3xl mb-3 font-medium bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Добро пожаловать в чат <br />
          CoolStory Beberony
        </p>
        <p className="text-center text-xl text-zinc-500 dark:text-gray-500">
          {isAuthenticated
            ? "Готов приступить к работе, нажми на кнопку Новый чат"
            : "Авторизуйтесь перед тем, как начать диалог."}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
