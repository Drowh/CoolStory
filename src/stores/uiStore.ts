import { create } from "zustand";
import { useSettingsStore } from "./settingsStore"; // Добавляем импорт

interface UIState {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  isRenameDialogOpen: boolean;
  setIsRenameDialogOpen: (value: boolean) => void;
  selectedTabId: string | null;
  setSelectedTabId: (id: string | null) => void;
  isAddToFolderDialogOpen: boolean;
  setIsAddToFolderDialogOpen: (value: boolean) => void;
  selectedChatId: number | null;
  setSelectedChatId: (id: number | null) => void;
  newChatName: string;
  setNewChatName: (value: string) => void;
  expandedFolderIds: number[];
  setExpandedFolderIds: (ids: number[]) => void;
  toggleFolderExpansion: (id: number) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarCollapsed: true,
  setIsSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
  openMenuId: null,
  setOpenMenuId: (id) => set({ openMenuId: id }),
  isRenameDialogOpen: false,
  setIsRenameDialogOpen: (value) => set({ isRenameDialogOpen: value }),
  selectedTabId: null,
  setSelectedTabId: (id) => set({ selectedTabId: id }),
  isAddToFolderDialogOpen: false,
  setIsAddToFolderDialogOpen: (value) =>
    set({ isAddToFolderDialogOpen: value }),
  selectedChatId: null,
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  newChatName: "",
  setNewChatName: (value) => set({ newChatName: value }),
  expandedFolderIds: [],
  setExpandedFolderIds: (ids) => set({ expandedFolderIds: ids }),
  toggleFolderExpansion: (id) => {
    const { expandedFolderIds } = get();
    const autoCollapse = useSettingsStore.getState().autoCollapseFolders;
    if (expandedFolderIds.includes(id)) {
      set({ expandedFolderIds: expandedFolderIds.filter((fid) => fid !== id) });
    } else {
      if (autoCollapse) {
        set({ expandedFolderIds: [id] });
      } else {
        set({ expandedFolderIds: [...expandedFolderIds, id] });
      }
    }
  },
}));
