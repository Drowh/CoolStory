import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";
import { useChatHistoryStore } from "../../../../stores/chatHistory";
import useToast from "../../../../hooks/useToast";

const ActionButtons: React.FC = () => {
  const exportChat = useChatHistoryStore((state) => state.exportChat);
  const toast = useToast();

  const handleExport = () => {
    try {
      exportChat();
      toast.success("Чат успешно экспортирован");
    } catch {
      toast.error("Не удалось экспортировать чат");
    }
  };

  return (
    <Button
      onClick={handleExport}
      className="text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
      variant="ghost"
      size="sm"
      aria-label="Экспортировать чат"
    >
      <FontAwesomeIcon icon="download" className="text-lg" aria-hidden="true" />
    </Button>
  );
};

export default ActionButtons;
