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
  const setSettingsActiveTab = useModalStore(
    (state) => state.setSettingsActiveTab
  );
  const { avatarId, changeAvatar } = useProfile();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const { toggleTheme, theme } = useTheme();

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
        aria-label="Профиль пользователя"
        type="button"
        aria-haspopup="true"
        aria-expanded={isProfileMenuOpen}
        aria-controls="profile-dropdown-menu"
      >
        <Avatar
          avatarId={isAuthenticated ? avatarId : 1}
          size="md"
          className="ring-2 ring-pink-500"
          aria-hidden="true"
        />
      </button>
      {isProfileMenuOpen && (
        <div
          id="profile-dropdown-menu"
          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-zinc-100 dark:border-gray-700 z-50 animate-fade-in-scale"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu-button"
        >
          <div className="py-1">
            <button
              onClick={handleAvatarClick}
              className={menuItemClass}
              role="menuitem"
              aria-expanded={showAvatarPicker}
              aria-controls="avatar-picker-area"
            >
              <FontAwesomeIcon
                icon="user-circle"
                className="text-zinc-400 dark:text-gray-500"
                aria-hidden="true"
              />
              {showAvatarPicker ? "Скрыть аватарки" : "Сменить аватарку"}
            </button>

            {showAvatarPicker && isAuthenticated && (
              <div
                id="avatar-picker-area"
                className="px-4 py-2"
                role="region"
                aria-label="Выбор аватара"
              >
                <AvatarPicker
                  selectedAvatarId={avatarId}
                  onSelectAvatar={handleSelectAvatar}
                />
              </div>
            )}

            <button
              onClick={() => {
                onProfileClick();
                setSettingsActiveTab("settings");
                setModalType("settings");
              }}
              className={menuItemClass}
              role="menuitem"
            >
              <FontAwesomeIcon
                icon="cog"
                className="text-zinc-400 dark:text-gray-500"
                aria-hidden="true"
              />
              Настройки
            </button>
            <button
              onClick={toggleTheme}
              className={menuItemClass}
              role="menuitem"
            >
              <FontAwesomeIcon
                icon={theme === "light" ? "sun" : "moon"}
                className="text-zinc-400 dark:text-gray-500"
                aria-hidden="true"
              />
              Тема
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
              role="menuitem"
            >
              <FontAwesomeIcon
                icon={
                  isAuthenticated ? "right-from-bracket" : "right-to-bracket"
                }
                className="text-zinc-400 dark:text-gray-500"
                aria-hidden="true"
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
