import { create } from "zustand";

type ModalType = "settings" | "theme" | "help" | null;

interface ModalState {
  modalType: ModalType;
  setModalType: (type: ModalType) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modalType: null,
  setModalType: (type) => set({ modalType: type }),
}));
