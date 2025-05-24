import { supabase } from "../utils/supabase";

interface Profile {
  id: string;
  avatar_id: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | null | undefined;
}

const AVATAR_ID_MIN = 1;
const AVATAR_ID_MAX = 10;

const validateAvatarId = (avatarId: number): boolean => {
  return (
    Number.isInteger(avatarId) &&
    avatarId >= AVATAR_ID_MIN &&
    avatarId <= AVATAR_ID_MAX
  );
};

const handleSupabaseError = (error: unknown): null => {
  if (error instanceof Error) {
    console.error("Ошибка Supabase:", error.message);
  } else {
    console.error("Неизвестная ошибка Supabase:", error);
  }
  return null;
};

export const getUserProfile = async (): Promise<Profile | null> => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    return profile;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const createUserProfile = async (
  avatarId = 1
): Promise<Profile | null> => {
  if (!validateAvatarId(avatarId)) {
    console.error("Некорректный ID аватара:", avatarId);
    return null;
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, avatar_id")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingProfile) {
      return existingProfile as Profile;
    }

    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([{ id: user.id, avatar_id: avatarId }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newProfile;
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const updateAvatar = async (
  avatarId: number
): Promise<Profile | null> => {
  if (!validateAvatarId(avatarId)) {
    console.error("Некорректный ID аватара:", avatarId);
    return null;
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, avatar_id")
      .eq("id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (!existingProfile) {
      return await createUserProfile(avatarId);
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_id: avatarId })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedProfile;
  } catch (error) {
    return handleSupabaseError(error);
  }
};
