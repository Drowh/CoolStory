import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Image from "next/image";
import cat from "../../assets/icons/cat.png";

interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`flex items-start ${
        isUser ? "justify-end" : "justify-start"
      } my-3 transition-all duration-200 ${
        isHovered ? "scale-101" : "scale-100"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 mr-3 flex items-center justify-center shadow-md overflow-hidden">
          <Image
            src={cat}
            alt="Assistant"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
      )}

      <div
        className={`relative  py-3 rounded-lg leading-relaxed break-words whitespace-pre-wrap transition-all duration-200
          ${
            isUser
              ? "text-base px-3 font-normal max-w-2xl bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 shadow-md"
              : "text-base font-normal w-full text-gray-100 chat-message-assistant"
          }`}
      >
        {isUser ? (
          message.text
        ) : (
          <div dangerouslySetInnerHTML={{ __html: message.text }} />
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 ml-3 flex items-center justify-center shadow-md">
          <FontAwesomeIcon icon="user" className="text-white text-sm" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
