import React, { useEffect, useRef } from "react";
import { useMessageStore } from "../../stores/messageStore";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import ChatMessage from "./ChatMessage";

const ChatArea: React.FC = () => {
  const { messages, isTyping, setMessagesEndRef, scrollToBottom } =
    useMessageStore();
  const { chatHistory } = useChatHistoryStore();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessagesEndRef(endOfMessagesRef);
  }, [setMessagesEndRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const activeChat = chatHistory.find((chat) => chat.isActive);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <p>Выберите чат или создайте новый</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex items-center justify-start space-x-2 px-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
