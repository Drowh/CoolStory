import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModalStore } from "../../../../stores/modalStore";
import Avatar from "../../../ui/Avatar";
import AvatarPicker from "../../../ui/AvatarPicker";
import { useProfile } from "../../../../contexts/ProfileContext";
import "../../../../styles/profileMenu.css";

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
  const { avatarId, changeAvatar } = useProfile();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const openAuthModal = () => {
    setModalType("auth");
  };

  const handleAvatarClick = () => {
    setShowAvatarPicker((prev) => !prev);
  };

  const handleSelectAvatar = async (id: number) => {
    await changeAvatar(id);
    setShowAvatarPicker(false);
  };

  return (
    <>
      <button
        onClick={onProfileClick}
        className="profile-menu-button relative bg-transparent p-0 rounded-full flex items-center justify-center z-10 focus:outline-none focus:shadow-none focus:border-none outline-none shadow-none border-none"
        aria-label="Профиль"
        type="button"
        style={{ outline: "none" }}
      >
        <Avatar
          avatarId={isAuthenticated ? avatarId : 1}
          size="md"
          className="ring-2 ring-pink-600"
        />
      </button>
      {isProfileMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 border border-gray-700">
          <div className="py-1">
            <button
              onClick={handleAvatarClick}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
            >
              <FontAwesomeIcon icon="user-circle" className="mr-2" />
              {showAvatarPicker ? "Скрыть аватарки" : "Сменить аватарку"}
            </button>

            {showAvatarPicker && isAuthenticated && (
              <AvatarPicker
                selectedAvatarId={avatarId}
                onSelectAvatar={handleSelectAvatar}
              />
            )}

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
