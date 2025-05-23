import React, { useState } from "react";
import { useChatHistoryStore } from "../../stores/chatHistory";
import { useUIStore } from "../../stores/uiStore";
import Button from "../ui/Button";
import DeleteFolderButton from "../ui/DeleteConfirmButton";
import useToast from "../../hooks/useToast";

const AddToFolderDialog: React.FC = () => {
  const isAddToFolderDialogOpen = useUIStore(
    (state) => state.isAddToFolderDialogOpen
  );
  const setIsAddToFolderDialogOpen = useUIStore(
    (state) => state.setIsAddToFolderDialogOpen
  );
  const selectedChatId = useUIStore((state) => state.selectedChatId);
  const setSelectedChatId = useUIStore((state) => state.setSelectedChatId);
  const folders = useChatHistoryStore((state) => state.folders);
  const createFolder = useChatHistoryStore((state) => state.createFolder);
  const addChatToFolder = useChatHistoryStore((state) => state.addChatToFolder);
  const toast = useToast();

  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      try {
        createFolder(newFolderName);
        toast.success(`Темка "${newFolderName}" создана`);
        setNewFolderName("");
      } catch {
        toast.error("Не удалось создать темку");
      }
    }
  };

  const handleAddToFolder = (folderId: number) => {
    if (selectedChatId !== null) {
      try {
        addChatToFolder(selectedChatId, folderId);
        const folderName =
          folders.find((f) => f.id === folderId)?.name || "выбранную темку";
        toast.success(`Чат добавлен в "${folderName}"`);
        setIsAddToFolderDialogOpen(false);
        setSelectedChatId(null);
      } catch {
        toast.error("Не удалось добавить чат в темку");
      }
    }
  };

  if (!isAddToFolderDialogOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={() => {
        setIsAddToFolderDialogOpen(false);
        setSelectedChatId(null);
      }}
      role="button"
      aria-label="Закрыть диалог добавления в темку"
    >
      <div
        className="rounded-lg p-6 w-full max-w-md animate-fade-in-scale 
      bg-white text-zinc-900 border border-zinc-200 shadow-lg 
      dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-folder-dialog-title"
      >
        <h2 id="add-to-folder-dialog-title" className="text-lg mb-4">
          Добавить в темку
        </h2>
        <div className="mb-4">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Название новой темки"
            className="w-full p-2 rounded-md focus:outline-none focus:ring-2 
            bg-zinc-100 text-zinc-900 border border-zinc-200 focus:border-pink-500 focus:ring-pink-500 
            dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-pink-500 dark:focus:border-pink-500"
            aria-label="Поле ввода названия новой темки"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
            }}
          />
          <Button
            onClick={handleCreateFolder}
            className="mt-2 w-full text-white hover:brightness-90 active:scale-95 transition-all duration-100"
            style={{ backgroundColor: "#f472b6" }}
            aria-label="Создать новую темку"
            disabled={!newFolderName.trim()}
            aria-disabled={!newFolderName.trim()}
          >
            Создать темку
          </Button>
        </div>
        <div
          className="max-h-60 overflow-y-auto"
          role="region"
          aria-label="Существующие темки"
        >
          {folders.length > 0 ? (
            <ul role="listbox" aria-label="Список темок для добавления">
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  className="flex items-center justify-between p-2 rounded-md mb-2 border-2 
                  border-zinc-200 hover:bg-zinc-100 hover:border-pink-500 focus-within:border-pink-500 transition-colors duration-200 
                  dark:border-gray-700 dark:hover:bg-gray-700"
                  role="option"
                  aria-label={`Темка: ${folder.name}`}
                  aria-selected="false"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAddToFolder(folder.id);
                    }
                  }}
                >
                  <button
                    onClick={() => handleAddToFolder(folder.id)}
                    className="flex-1 text-left 
                    text-zinc-900 hover:text-zinc-700 
                    dark:text-gray-200 dark:hover:text-gray-100"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <span className="flex-1 text-left">{folder.name}</span>
                  </button>
                  <div className="ml-4">
                    <DeleteFolderButton
                      itemId={folder.id}
                      itemType="folder"
                      label=""
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Нет доступных темок</p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => {
              setIsAddToFolderDialogOpen(false);
              setSelectedChatId(null);
            }}
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddToFolderDialog;
