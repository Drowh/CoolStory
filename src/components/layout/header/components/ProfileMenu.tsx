import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";
import { useModalStore } from "../../../../stores/modalStore";

interface ProfileMenuProps {
  isProfileMenuOpen: boolean;
  isAuthenticated: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isProfileMenuOpen,
  isAuthenticated,
  onProfileClick,
  onLogout,
}) => {
  const setModalType = useModalStore((state) => state.setModalType);

  const openAuthModal = () => {
    setModalType("auth");
  };

  return (
    <>
      <Button
        onClick={onProfileClick}
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
                onProfileClick();
                setModalType("settings");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <FontAwesomeIcon icon="cog" className="mr-2" />
              Настройки
            </button>
            <button
              onClick={() => {
                onProfileClick();
                setModalType("theme");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <FontAwesomeIcon icon="palette" className="mr-2" />
              Тема
            </button>
            <button
              onClick={() => {
                onProfileClick();
                setModalType("help");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <FontAwesomeIcon icon="question-circle" className="mr-2" />
              Помощь
            </button>
          </div>
          <div className="border-t border-gray-700">
            <button
              onClick={
                isAuthenticated
                  ? onLogout
                  : () => {
                      onProfileClick();
                      openAuthModal();
                    }
              }
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <FontAwesomeIcon
                icon={
                  isAuthenticated ? "right-from-bracket" : "right-to-bracket"
                }
                className="mr-2"
              />
              {isAuthenticated ? "Выйти" : "Войти"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileMenu;
