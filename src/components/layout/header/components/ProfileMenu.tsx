import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModalStore } from "../../../../stores/modalStore";
import Avatar from "../../../ui/Avatar";
import AvatarPicker from "../../../ui/AvatarPicker";
import { useProfile } from "../../../../contexts/ProfileContext";
import "../../../../styles/profileMenu.css";
import { useTheme } from "../../../ThemeProvider";

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
  const { toggleTheme } = useTheme();

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

  const menuItemClass =
    "w-full text-left px-4 py-2.5 text-sm text-zinc-600 dark:text-gray-300 hover:bg-zinc-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors duration-200";

  return (
    <>
      <button
        onClick={onProfileClick}
        className="profile-menu-button relative bg-transparent p-0 rounded-full flex items-center justify-center z-10 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-200"
        aria-label="Профиль"
        type="button"
      >
        <Avatar
          avatarId={isAuthenticated ? avatarId : 1}
          size="md"
          className="ring-2 ring-pink-500"
        />
      </button>
      {isProfileMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-zinc-100 dark:border-gray-700 z-50 animate-fade-in-scale">
          <div className="py-1">
            <button onClick={handleAvatarClick} className={menuItemClass}>
              <FontAwesomeIcon
                icon="user-circle"
                className="text-zinc-400 dark:text-gray-500"
              />
              {showAvatarPicker ? "Скрыть аватарки" : "Сменить аватарку"}
            </button>

            {showAvatarPicker && isAuthenticated && (
              <div className="px-4 py-2">
                <AvatarPicker
                  selectedAvatarId={avatarId}
                  onSelectAvatar={handleSelectAvatar}
                />
              </div>
            )}

            <button
              onClick={() => {
                onProfileClick();
                setModalType("settings");
              }}
              className={menuItemClass}
            >
              <FontAwesomeIcon
                icon="cog"
                className="text-zinc-400 dark:text-gray-500"
              />
              Настройки
            </button>
            <button onClick={toggleTheme} className={menuItemClass}>
              <FontAwesomeIcon
                icon="palette"
                className="text-zinc-400 dark:text-gray-500"
              />
              Тема
            </button>
            <button
              onClick={() => {
                onProfileClick();
                setModalType("help");
              }}
              className={menuItemClass}
            >
              <FontAwesomeIcon
                icon="question-circle"
                className="text-zinc-400 dark:text-gray-500"
              />
              Помощь
            </button>
          </div>
          <div className="border-t border-zinc-100 dark:border-gray-700">
            <button
              onClick={
                isAuthenticated
                  ? onLogout
                  : () => {
                      onProfileClick();
                      openAuthModal();
                    }
              }
              className={menuItemClass}
            >
              <FontAwesomeIcon
                icon={
                  isAuthenticated ? "right-from-bracket" : "right-to-bracket"
                }
                className="text-zinc-400 dark:text-gray-500"
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
