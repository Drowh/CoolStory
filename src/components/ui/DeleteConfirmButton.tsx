import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import Button from "./Button";

interface DeleteConfirmButtonProps {
  itemId: number;
  itemType: "chat" | "folder" | "chat-from-folder";
  label?: string;
  onDelete?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
}

const DeleteConfirmButton: React.FC<DeleteConfirmButtonProps> = ({
  itemId,
  itemType,
  label = "Удалить",
  onDelete,
  onCancel,
  onClick,
}) => {
  const { deleteChat, deleteFolder, removeChatFromFolder } =
    useChatHistoryStore();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(true);
    if (onClick) onClick();
  };

  const confirmDelete = () => {
    if (itemType === "chat") {
      deleteChat(itemId);
    } else if (itemType === "folder") {
      deleteFolder(itemId);
    } else if (itemType === "chat-from-folder") {
      removeChatFromFolder(itemId);
    }
    setIsDeleteConfirmOpen(false);
    if (onDelete) onDelete();
  };

  const buttonClassName = label
    ? "flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
    : "text-red-400 hover:text-red-300 p-1";

  return (
    <>
      <button
        onClick={handleDelete}
        className={buttonClassName}
        aria-label={`Удалить ${
          itemType === "chat"
            ? "чат"
            : itemType === "folder"
            ? "темку"
            : "чат из темки"
        }`}
      >
        <FontAwesomeIcon icon="trash-alt" className={label ? "mr-2" : ""} />
        {label && <span>{label}</span>}
      </button>

      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => {
            setIsDeleteConfirmOpen(false);
            if (onCancel) onCancel();
          }}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg text-gray-200 mb-4">
              {itemType === "chat"
                ? "Удалить чат?"
                : itemType === "folder"
                ? "Удалить темку?"
                : "Удалить чат из темки?"}
            </h2>
            <p className="text-gray-400 mb-4">
              {itemType === "chat"
                ? "Вы уверены, что хотите удалить этот чат?"
                : itemType === "folder"
                ? "Вы уверены, что хотите удалить эту темку? Все чаты останутся в общем списке."
                : "Вы уверены, что хотите удалить этот чат из темки? Чат останется в общем списке."}
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  if (onCancel) onCancel();
                }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Отмена
              </Button>
              <Button
                onClick={confirmDelete}
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

export default DeleteConfirmButton;
