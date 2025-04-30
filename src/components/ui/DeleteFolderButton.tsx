import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import Button from "./Button";

interface DeleteFolderButtonProps {
  folderId: number;
}

const DeleteFolderButton: React.FC<DeleteFolderButtonProps> = ({
  folderId,
}) => {
  const deleteFolder = useChatHistoryStore((state) => state.deleteFolder);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDeleteFolder = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteFolder = () => {
    deleteFolder(folderId);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <>
      <button
        onClick={handleDeleteFolder}
        className="text-red-400 hover:text-red-300 p-1"
        aria-label="Удалить темку"
      >
        <FontAwesomeIcon icon="trash-alt" />
      </button>

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg text-gray-200 mb-4">Удалить темку?</h2>
            <p className="text-gray-400 mb-4">
              Вы уверены, что хотите удалить эту темку? Все чаты останутся в
              общем списке.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Отмена
              </Button>
              <Button
                onClick={confirmDeleteFolder}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteFolderButton;
