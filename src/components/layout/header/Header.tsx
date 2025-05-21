import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../utils/supabase";
import { Logo, ProfileMenu, ActionButtons } from "./components";

const Header: React.FC = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Ошибка выхода:", error);
    } else {
      setIsAuthenticated(false);
      setIsProfileMenuOpen(false);
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      <Logo />
      <div className="flex items-center space-x-3 relative">
        <ActionButtons />
        <div ref={profileMenuRef}>
          <ProfileMenu
            isProfileMenuOpen={isProfileMenuOpen}
            isAuthenticated={isAuthenticated}
            onProfileClick={handleProfileClick}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
