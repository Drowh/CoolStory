import { create } from "zustand";

type ModalType = "settings" | "auth" | null;
type SettingsTab = "settings" | "help" | "terms";

interface ModalState {
  modalType: ModalType;
  settingsActiveTab: SettingsTab;
  setModalType: (type: ModalType) => void;
  setSettingsActiveTab: (tab: SettingsTab) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modalType: null,
  settingsActiveTab: "settings",
  setModalType: (type) => set({ modalType: type }),
  setSettingsActiveTab: (tab) => set({ settingsActiveTab: tab }),
}));
