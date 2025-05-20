import React from "react";
import ChatMessage from "../../ChatMessage";
import { Message } from "../../../../types";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex flex-col w-full space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${
            message.sender === "user" ? "max-w-2xl ml-auto" : "w-full"
          }`}
        >
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
};

export default MessageList;
