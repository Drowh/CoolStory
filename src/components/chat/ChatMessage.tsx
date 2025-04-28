import React from "react";
import { Message } from "../../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex items-end ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
          <FontAwesomeIcon icon="robot" className="text-gray-300 text-sm" />
        </div>
      )}
      <div
        className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap
        ${isUser ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-100"}`}
      >
        {message.text}
        <span className="block text-xs text-gray-400 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 ml-3 flex items-center justify-center">
          <FontAwesomeIcon icon="user" className="text-gray-300 text-sm" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
