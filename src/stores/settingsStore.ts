import { create, StateCreator } from "zustand";
import { useCallback, useMemo } from "react";

export interface SettingsState {
  autoCollapseFolders: boolean;
  setAutoCollapseFolders: (value: boolean) => void;
  resetSettings: () => void;
}

const validateBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

const createSettingsStore: StateCreator<SettingsState> = (set) => ({
  autoCollapseFolders: false,
  setAutoCollapseFolders: (value) => {
    if (!validateBoolean(value)) {
      console.error("Invalid auto collapse folders value:", value);
      return;
    }
    set({ autoCollapseFolders: value });
  },
  resetSettings: () =>
    set({
      autoCollapseFolders: false,
    }),
});

export const useSettingsStore = create<SettingsState>(createSettingsStore);

export const useSettingsStoreOptimized = () => {
  const store = useSettingsStore();

  const setAutoCollapseFolders = useCallback(
    (value: boolean) => {
      store.setAutoCollapseFolders(value);
    },
    [store]
  );

  const resetSettings = useCallback(() => {
    store.resetSettings();
  }, [store]);

  const autoCollapseFolders = useMemo(
    () => store.autoCollapseFolders,
    [store.autoCollapseFolders]
  );

  return {
    autoCollapseFolders,
    setAutoCollapseFolders,
    resetSettings,
  };
};
