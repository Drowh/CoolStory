import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Logo, ProfileMenu, ActionButtons } from "./components";

const Header: React.FC = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    checkAuth();
  }, []);

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
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <Logo />
      <div className="flex items-center space-x-3 relative">
        <ActionButtons />
        <ProfileMenu
          isProfileMenuOpen={isProfileMenuOpen}
          isAuthenticated={isAuthenticated}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
        />
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          img {
            width: 80px;
            height: 24px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
