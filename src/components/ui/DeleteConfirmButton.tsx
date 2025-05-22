import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatHistoryStore } from "../../stores/chatHistory";
import Button from "./Button";
import useToast from "../../hooks/useToast";

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
  const toast = useToast();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirmOpen(true);
    if (onClick) onClick();
  };

  const confirmDelete = () => {
    try {
      if (itemType === "chat") {
        deleteChat(itemId);
        toast.success("Чат успешно удален");
      } else if (itemType === "folder") {
        deleteFolder(itemId);
        toast.success("Темка успешно удалена");
      } else if (itemType === "chat-from-folder") {
        removeChatFromFolder(itemId);
        toast.success("Чат удален из темки");
      }
      setIsDeleteConfirmOpen(false);
      if (onDelete) onDelete();
    } catch {
      toast.error(
        `Ошибка при удалении ${
          itemType === "chat"
            ? "чата"
            : itemType === "folder"
            ? "темки"
            : "чата из темки"
        }`
      );
    }
  };

  const buttonClassName = label
    ? "flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-gray-700"
    : "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1";

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={() => {
            setIsDeleteConfirmOpen(false);
            if (onCancel) onCancel();
          }}
        >
          <div
            className="rounded-lg p-6 w-full max-w-sm animate-fade-in-scale 
            bg-white text-zinc-900 shadow-lg border border-zinc-200 
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg mb-4">
              {itemType === "chat"
                ? "Удалить чат?"
                : itemType === "folder"
                ? "Удалить темку?"
                : "Удалить чат из темки?"}
            </h2>
            <p
              className="mb-4 
            text-zinc-600 
            dark:text-gray-400"
            >
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
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                Отмена
              </Button>
              <Button
                onClick={confirmDelete}
                variant="solid"
                className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                style={{ backgroundColor: "#dc2626", color: "#fff" }}
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
