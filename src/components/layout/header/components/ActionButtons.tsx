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
      className="text-gray-400 bg-tran hover:bg-gray-700 hover:text-gray-200"
    >
      <FontAwesomeIcon icon="download" />
    </Button>
  );
};

export default ActionButtons;
