import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useModalStore } from "../../stores/modalStore";
import Button from "../ui/Button";
import Image from "next/image";
import logo from "../../assets/icons/logo.png";

const Header: React.FC = () => {
  const exportChat = useChatHistoryStore((state) => state.exportChat);
  const setModalType = useModalStore((state) => state.setModalType);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <Image src={logo} alt="logo" width={150} height={40} className="ml-9" />
      <div className="flex items-center space-x-2 relative">
        <Button
          onClick={() => {
            exportChat();
          }}
          className="text-gray-400 hover:text-gray-200"
        >
          <FontAwesomeIcon icon="download" />
        </Button>
        <Button
          onClick={handleProfileClick}
          className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-10 h-10 flex items-center justify-center z-10"
          aria-label="Профиль"
        >
          <FontAwesomeIcon icon="user" />
        </Button>
        {isProfileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                <FontAwesomeIcon icon="user-circle" className="mr-2" />
                Профиль
              </button>
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setModalType("settings");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <FontAwesomeIcon icon="cog" className="mr-2" />
                Настройки
              </button>
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setModalType("theme");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <FontAwesomeIcon icon="palette" className="mr-2" />
                Тема
              </button>
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setModalType("help");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
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
