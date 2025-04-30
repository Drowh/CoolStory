import React, { useEffect } from "react";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useUIStore } from "../../stores/uiStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const RenameDialog: React.FC = () => {
  const { chatHistory, setChatHistory } = useChatHistoryStore();
  const {
    isRenameDialogOpen,
    setIsRenameDialogOpen,
    selectedTabId,
    newChatName,
    setNewChatName,
  } = useUIStore();

  useEffect(() => {
    if (!isRenameDialogOpen) {
      setNewChatName("");
    }
  }, [isRenameDialogOpen, setNewChatName]);

  const handleRename = () => {
    if (selectedTabId !== null && newChatName.trim() !== "") {
      const chatId = parseInt(selectedTabId);
      if (isNaN(chatId)) return; // Проверка на случай, если selectedTabId не является числом
      setChatHistory(
        chatHistory.map((chat) =>
          chat.id === chatId ? { ...chat, title: newChatName.trim() } : chat
        )
      );
      setIsRenameDialogOpen(false);
      setNewChatName("");
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
    >
      <div
        className="bg-gray-800 p-4 rounded-md w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Переименовать чат</h2>
        <Input
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Новое название"
          className="mb-4"
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsRenameDialogOpen(false)}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Отмена
          </Button>
          <Button
            onClick={handleRename}
            className="bg-pink-600 hover:bg-pink-700"
            disabled={!newChatName.trim()}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RenameDialog;
