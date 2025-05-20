import React from 'react';

interface WelcomeScreenProps {
  openAuthModal: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ openAuthModal }) => {
  return (
    <div className="flex-1 mt-6 mx-2 flex flex-col items-center justify-center text-gray-400 transition-all duration-500 opacity-90 hover:opacity-100">
      <div
        onClick={openAuthModal}
        className="p-8 rounded-xl bg-gray-800 bg-opacity-50 shadow-2xl transform transition-transform duration-300 hover:scale-105 max-w-md w-full mx-4 backdrop-blur-sm cursor-pointer"
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
          className="mx-auto mb-6 text-gray-600 animate-float"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-center text-xl mb-3 font-light bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Добро пожаловать в чат <br />
          CoolStory Beberony
        </p>
        <p className="text-center text-sm text-gray-600">
          Авторизуйтесь перед тем, как начать диалог.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen; 