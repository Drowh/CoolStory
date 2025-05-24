import { create, StateCreator } from "zustand";
import { useCallback, useMemo } from "react";
import { useSettingsStore } from "./settingsStore";

export interface UIState {
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
  expandedFolderIds: Set<number>;
  setExpandedFolderIds: (ids: number[]) => void;
  toggleFolderExpansion: (id: number) => void;
  resetUIState: () => void;
}

const validateId = (id: unknown): id is string | null => {
  return id === null || typeof id === "string";
};

const validateChatId = (id: unknown): id is number | null => {
  return (
    id === null || (typeof id === "number" && Number.isInteger(id) && id > 0)
  );
};

const validateFolderIds = (ids: unknown): ids is number[] => {
  return (
    Array.isArray(ids) &&
    ids.every((id) => typeof id === "number" && Number.isInteger(id) && id > 0)
  );
};

const createUIStore: StateCreator<UIState> = (set, get) => ({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: (value) => {
    if (typeof value !== "boolean") {
      console.error("Invalid sidebar collapse value:", value);
      return;
    }
    set({ isSidebarCollapsed: value });
  },
  openMenuId: null,
  setOpenMenuId: (id) => {
    if (!validateId(id)) {
      console.error("Invalid menu ID:", id);
      return;
    }
    set({ openMenuId: id });
  },
  isRenameDialogOpen: false,
  setIsRenameDialogOpen: (value) => {
    if (typeof value !== "boolean") {
      console.error("Invalid rename dialog value:", value);
      return;
    }
    set({ isRenameDialogOpen: value });
  },
  selectedTabId: null,
  setSelectedTabId: (id) => {
    if (!validateId(id)) {
      console.error("Invalid tab ID:", id);
      return;
    }
    set({ selectedTabId: id });
  },
  isAddToFolderDialogOpen: false,
  setIsAddToFolderDialogOpen: (value) => {
    if (typeof value !== "boolean") {
      console.error("Invalid add to folder dialog value:", value);
      return;
    }
    set({ isAddToFolderDialogOpen: value });
  },
  selectedChatId: null,
  setSelectedChatId: (id) => {
    if (!validateChatId(id)) {
      console.error("Invalid chat ID:", id);
      return;
    }
    set({ selectedChatId: id });
  },
  newChatName: "",
  setNewChatName: (value) => {
    if (typeof value !== "string") {
      console.error("Invalid chat name:", value);
      return;
    }
    set({ newChatName: value });
  },
  expandedFolderIds: new Set(),
  setExpandedFolderIds: (ids) => {
    if (!validateFolderIds(ids)) {
      console.error("Invalid folder IDs:", ids);
      return;
    }
    set({ expandedFolderIds: new Set(ids) });
  },
  toggleFolderExpansion: (id) => {
    if (!validateChatId(id)) {
      console.error("Invalid folder ID:", id);
      return;
    }
    const { expandedFolderIds } = get();
    const autoCollapse = useSettingsStore.getState().autoCollapseFolders;
    const newExpandedIds = new Set(expandedFolderIds);

    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id);
    } else {
      if (autoCollapse) {
        newExpandedIds.clear();
      }
      newExpandedIds.add(id);
    }
    set({ expandedFolderIds: newExpandedIds });
  },
  resetUIState: () =>
    set({
      isSidebarCollapsed: false,
      openMenuId: null,
      isRenameDialogOpen: false,
      selectedTabId: null,
      isAddToFolderDialogOpen: false,
      selectedChatId: null,
      newChatName: "",
      expandedFolderIds: new Set(),
    }),
});

export const useUIStore = create<UIState>(createUIStore);

export const useUIStoreOptimized = () => {
  const store = useUIStore();

  const setIsSidebarCollapsed = useCallback(
    (value: boolean) => {
      store.setIsSidebarCollapsed(value);
    },
    [store]
  );

  const setOpenMenuId = useCallback(
    (id: string | null) => {
      store.setOpenMenuId(id);
    },
    [store]
  );

  const setIsRenameDialogOpen = useCallback(
    (value: boolean) => {
      store.setIsRenameDialogOpen(value);
    },
    [store]
  );

  const setSelectedTabId = useCallback(
    (id: string | null) => {
      store.setSelectedTabId(id);
    },
    [store]
  );

  const setIsAddToFolderDialogOpen = useCallback(
    (value: boolean) => {
      store.setIsAddToFolderDialogOpen(value);
    },
    [store]
  );

  const setSelectedChatId = useCallback(
    (id: number | null) => {
      store.setSelectedChatId(id);
    },
    [store]
  );

  const setNewChatName = useCallback(
    (value: string) => {
      store.setNewChatName(value);
    },
    [store]
  );

  const setExpandedFolderIds = useCallback(
    (ids: number[]) => {
      store.setExpandedFolderIds(ids);
    },
    [store]
  );

  const toggleFolderExpansion = useCallback(
    (id: number) => {
      store.toggleFolderExpansion(id);
    },
    [store]
  );

  const resetUIState = useCallback(() => {
    store.resetUIState();
  }, [store]);

  const isSidebarCollapsed = useMemo(
    () => store.isSidebarCollapsed,
    [store.isSidebarCollapsed]
  );
  const openMenuId = useMemo(() => store.openMenuId, [store.openMenuId]);
  const isRenameDialogOpen = useMemo(
    () => store.isRenameDialogOpen,
    [store.isRenameDialogOpen]
  );
  const selectedTabId = useMemo(
    () => store.selectedTabId,
    [store.selectedTabId]
  );
  const isAddToFolderDialogOpen = useMemo(
    () => store.isAddToFolderDialogOpen,
    [store.isAddToFolderDialogOpen]
  );
  const selectedChatId = useMemo(
    () => store.selectedChatId,
    [store.selectedChatId]
  );
  const newChatName = useMemo(() => store.newChatName, [store.newChatName]);
  const expandedFolderIds = useMemo(
    () => Array.from(store.expandedFolderIds),
    [store.expandedFolderIds]
  );

  return {
    isSidebarCollapsed,
    openMenuId,
    isRenameDialogOpen,
    selectedTabId,
    isAddToFolderDialogOpen,
    selectedChatId,
    newChatName,
    expandedFolderIds,
    setIsSidebarCollapsed,
    setOpenMenuId,
    setIsRenameDialogOpen,
    setSelectedTabId,
    setIsAddToFolderDialogOpen,
    setSelectedChatId,
    setNewChatName,
    setExpandedFolderIds,
    toggleFolderExpansion,
    resetUIState,
  };
};
