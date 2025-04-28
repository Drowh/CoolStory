import { create } from "zustand";

interface UIState {
  selectedTabId: number | null;
  setSelectedTabId: (id: number | null) => void;
  isRenameDialogOpen: boolean;
  setIsRenameDialogOpen: (isOpen: boolean) => void;
  newChatName: string;
  setNewChatName: (name: string) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedTabId: null,
  setSelectedTabId: (id) => {
    console.log("setSelectedTabId вызван, id:", id);
    set({ selectedTabId: id });
  },

  isRenameDialogOpen: false,
  setIsRenameDialogOpen: (isOpen) => {
    console.log("setIsRenameDialogOpen вызван, isOpen:", isOpen);
    set({ isRenameDialogOpen: isOpen });
  },

  newChatName: "",
  setNewChatName: (name) => {
    console.log("setNewChatName вызван, name:", name);
    set({ newChatName: name });
  },

  openMenuId: null,
  setOpenMenuId: (id) => {
    console.log("setOpenMenuId вызван, id:", id);
    set({ openMenuId: id });
  },

  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (isCollapsed) => {
    console.log("setIsSidebarCollapsed вызван, isCollapsed:", isCollapsed);
    set((state) => {
      console.log(
        "Текущее состояние isSidebarCollapsed:",
        state.isSidebarCollapsed
      );
      console.log("Новое состояние isSidebarCollapsed:", isCollapsed);
      return { isSidebarCollapsed: isCollapsed };
    });
  },

  isDarkMode: true,
  setIsDarkMode: (isDark) => {
    console.log("setIsDarkMode вызван, isDark:", isDark);
    if (typeof window !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    set({ isDarkMode: isDark });
  },
}));
