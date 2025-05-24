import { create, StateCreator } from "zustand";
import { useCallback, useMemo } from "react";

export type ModalType = "settings" | "auth" | null;
export type SettingsTab = "settings" | "help" | "terms";

interface ModalState {
  modalType: ModalType;
  settingsActiveTab: SettingsTab;
  setModalType: (type: ModalType) => void;
  setSettingsActiveTab: (tab: SettingsTab) => void;
  isModalOpen: boolean;
  closeModal: () => void;
}

const validateModalType = (type: unknown): type is ModalType => {
  return type === null || type === "settings" || type === "auth";
};

const validateSettingsTab = (tab: unknown): tab is SettingsTab => {
  return tab === "settings" || tab === "help" || tab === "terms";
};

const createModalStore: StateCreator<ModalState> = (set) => ({
  modalType: null,
  settingsActiveTab: "settings",
  isModalOpen: false,
  setModalType: (type) => {
    if (!validateModalType(type)) {
      console.error("Invalid modal type:", type);
      return;
    }
    set({ modalType: type, isModalOpen: type !== null });
  },
  setSettingsActiveTab: (tab) => {
    if (!validateSettingsTab(tab)) {
      console.error("Invalid settings tab:", tab);
      return;
    }
    set({ settingsActiveTab: tab });
  },
  closeModal: () => set({ modalType: null, isModalOpen: false }),
});

export const useModalStore = create<ModalState>(createModalStore);

export const useModalStoreOptimized = () => {
  const store = useModalStore();

  const setModalType = useCallback(
    (type: ModalType) => {
      store.setModalType(type);
    },
    [store]
  );

  const setSettingsActiveTab = useCallback(
    (tab: SettingsTab) => {
      store.setSettingsActiveTab(tab);
    },
    [store]
  );

  const closeModal = useCallback(() => {
    store.closeModal();
  }, [store]);

  const modalType = useMemo(() => store.modalType, [store.modalType]);
  const settingsActiveTab = useMemo(
    () => store.settingsActiveTab,
    [store.settingsActiveTab]
  );
  const isModalOpen = useMemo(() => store.isModalOpen, [store.isModalOpen]);

  return {
    modalType,
    settingsActiveTab,
    isModalOpen,
    setModalType,
    setSettingsActiveTab,
    closeModal,
  };
};
