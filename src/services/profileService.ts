import { supabase } from "../utils/supabase";

export const getUserProfile = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Ошибка при запросе профиля:", error.message);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    return null;
  }
};

export const createUserProfile = async (avatarId = 1) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) return existingProfile;

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert([{ id: user.id, avatar_id: avatarId }])
      .select()
      .single();

    if (error) {
      console.error("Ошибка при создании профиля:", error.message);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error("Ошибка при создании профиля:", error);
    return null;
  }
};

export const updateAvatar = async (avatarId: number) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      return await createUserProfile(avatarId);
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({ avatar_id: avatarId })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Ошибка при обновлении аватарки:", error.message);
      return null;
    }

    return updatedProfile;
  } catch (error) {
    console.error("Ошибка при обновлении аватарки:", error);
    return null;
  }
};
