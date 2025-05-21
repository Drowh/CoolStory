"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import {
  getUserProfile,
  createUserProfile,
  updateAvatar,
} from "../services/profileService";
import useToast from "../hooks/useToast";

interface Profile {
  id: string;
  avatar_id: number;
  [key: string]: string | number | boolean | null;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  avatarId: number;
  changeAvatar: (id: number) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  const loadProfile = async () => {
    setLoading(true);

    try {
      const userProfile = await getUserProfile();

      if (!userProfile) {
        const newProfile = await createUserProfile();
        setProfile(newProfile);
      } else {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const changeAvatar = async (avatarId: number) => {
    try {
      const updatedProfile = await updateAvatar(avatarId);

      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success("Аватарка успешно изменена");
        return true;
      } else {
        toast.error("Не удалось обновить аватарку");
        return false;
      }
    } catch {
      toast.error("Произошла ошибка при обновлении аватарки");
      return false;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        avatarId: profile?.avatar_id || 1,
        changeAvatar,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile должен использоваться внутри ProfileProvider");
  }
  return context;
};

export default ProfileContext;
