import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import Button from "../ui/Button";

const Header: React.FC = () => {
  const exportChat = useChatHistoryStore((state) => state.exportChat);
  const chatHistory = useChatHistoryStore((state) => state.chatHistory);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    console.log("Клик на кнопку профиля");
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold">AI Ассистент</h1>
      <div className="flex items-center space-x-2 relative">
        <Button
          onClick={() => {
            console.log("Клик на экспорт чата, chatHistory:", chatHistory);
            exportChat();
          }}
          className="text-gray-400 hover:text-gray-200"
        >
          <FontAwesomeIcon icon="download" />
        </Button>
        <Button
          onClick={handleProfileClick}
          className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
          aria-label="Профиль"
        >
          B
        </Button>
        {isProfileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <FontAwesomeIcon icon="user-circle" className="mr-2" />
                Профиль
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <FontAwesomeIcon icon="cog" className="mr-2" />
                Настройки
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <FontAwesomeIcon icon="palette" className="mr-2" />
                Тема
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <FontAwesomeIcon icon="question-circle" className="mr-2" />
                Помощь
              </button>
            </div>
            <div className="border-t border-gray-700">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <FontAwesomeIcon icon="sign-in-alt" className="mr-2" />
                Войти
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
