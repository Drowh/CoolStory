import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../../../ui/Button";
import { useChatHistoryStore } from "../../../../stores/chatHistory";

const ActionButtons: React.FC = () => {
  const exportChat = useChatHistoryStore((state) => state.exportChat);

  return (
    <Button
      onClick={() => exportChat()}
      className="text-gray-400 py-3 hover:bg-gray-700 hover:text-gray-200"
    >
      <FontAwesomeIcon icon="download" />
    </Button>
  );
};

export default ActionButtons;
