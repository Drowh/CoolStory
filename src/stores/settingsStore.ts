import { create } from "zustand";

interface SettingsState {
  autoCollapseFolders: boolean;
  setAutoCollapseFolders: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  autoCollapseFolders: false, 
  setAutoCollapseFolders: (value) => set({ autoCollapseFolders: value }),
}));
