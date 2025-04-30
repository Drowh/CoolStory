import React, { useState } from "react";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";
import Button from "../ui/Button";
import DeleteFolderButton from "../ui/DeleteFolderButton";

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

  const [newFolderName, setNewFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName("");
    }
  };

  const handleAddToFolder = (folderId: number) => {
    if (selectedChatId !== null) {
      addChatToFolder(selectedChatId, folderId);
      setIsAddToFolderDialogOpen(false);
      setSelectedChatId(null);
    }
  };

  if (!isAddToFolderDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg text-gray-200 mb-4">Добавить в темку</h2>
        <div className="mb-4">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Название новой темки"
            className="w-full p-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <Button
            onClick={handleCreateFolder}
            className="mt-2 bg-pink-600 hover:bg-pink-700 text-white w-full"
          >
            Создать темку
          </Button>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {folders.length > 0 ? (
            folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between p-2 border-gray-700 border-2 rounded-md mb-2"
              >
                <button
                  onClick={() => handleAddToFolder(folder.id)}
                  className="text-gray-200 hover:text-gray-100 flex-1 text-left"
                >
                  {folder.name}
                </button>
                <DeleteFolderButton folderId={folder.id} />
              </div>
            ))
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
            className="bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddToFolderDialog;
