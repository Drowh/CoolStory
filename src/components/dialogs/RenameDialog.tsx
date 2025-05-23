import React, { useEffect } from "react";
import { useChatHistoryStore } from "../../stores/chatHistory";
import { useUIStore } from "../../stores/uiStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import useToast from "../../hooks/useToast";

const RenameDialog: React.FC = () => {
  const { renameChat } = useChatHistoryStore();
  const {
    isRenameDialogOpen,
    setIsRenameDialogOpen,
    selectedTabId,
    newChatName,
    setNewChatName,
  } = useUIStore();
  const toast = useToast();

  useEffect(() => {
    if (!isRenameDialogOpen) {
      setNewChatName("");
    }
  }, [isRenameDialogOpen, setNewChatName]);

  const handleRename = async () => {
    if (selectedTabId !== null && newChatName.trim() !== "") {
      const chatId = parseInt(selectedTabId);
      if (isNaN(chatId)) return;

      try {
        await renameChat(chatId, newChatName.trim());
        setIsRenameDialogOpen(false);
        setNewChatName("");
        toast.success("Чат успешно переименован");
      } catch (error) {
        console.error("Ошибка переименования чата:", error);
        toast.error("Не удалось переименовать чат");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setIsRenameDialogOpen(false);
    }
  };

  if (!isRenameDialogOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setIsRenameDialogOpen(false)}
      role="button"
      aria-label="Закрыть диалог переименования"
    >
      <div
        className="bg-white dark:bg-gray-800 p-4 rounded-md w-80"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-dialog-title"
      >
        <h2
          id="rename-dialog-title"
          className="text-lg font-semibold mb-4 text-zinc-900 dark:text-gray-200"
        >
          Переименовать чат
        </h2>
        <Input
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Новое название"
          className="mb-4"
          autoFocus
          aria-label="Поле ввода нового названия чата"
        />
        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsRenameDialogOpen(false)}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
          >
            Отмена
          </Button>
          <Button
            onClick={handleRename}
            className="bg-pink-600 hover:bg-pink-700 text-white"
            disabled={!newChatName.trim()}
            aria-disabled={!newChatName.trim()}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RenameDialog;
