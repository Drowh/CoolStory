import React, { useEffect, useState } from "react";
import { useMessageStore } from "../../../stores/messageStore";
import { useChatHistoryStore } from "../../../stores/chatHistory";
import { useModalStore } from "../../../stores/modalStore";
import { supabase } from "../../../utils/supabase";
import LoadingIndicator from "../LoadingIndicator";
import useScrollManagement from "../../../hooks/chat-area/useScrollManagement";
import {
  WelcomeScreen,
  EmptyChat,
  TypingIndicator,
  ScrollToBottomButton,
  MessageList,
} from "./components";

const ChatArea: React.FC = () => {
  const { messages, isTyping, setMessagesEndRef, focusInputField } =
    useMessageStore();
  const { chatHistory, loadingChatId } = useChatHistoryStore();
  const { setModalType } = useModalStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const activeChat = chatHistory.find((chat) => chat.isActive);
  const isLoading =
    loadingChatId !== null && activeChat && activeChat.id === loadingChatId;

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    checkAuth();
  }, []);

  const {
    endOfMessagesRef,
    chatContainerRef,
    fadeIn,
    showScrollButton,
    scrollToBottomManually,
  } = useScrollManagement({
    messages,
    isTyping,
    activeChat: activeChat || null,
    focusInputField,
  });

  useEffect(() => {
    setMessagesEndRef(endOfMessagesRef);
  }, [setMessagesEndRef, endOfMessagesRef]);

  const openAuthModal = () => {
    setModalType("auth");
  };

  if (!activeChat && chatHistory.length === 0) {
    return (
      <WelcomeScreen
        openAuthModal={openAuthModal}
        isAuthenticated={isAuthenticated}
      />
    );
  }

  return (
    <div
      className={`relative flex flex-col transition-all duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
      style={{
        height: "calc(100vh - 200px)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex-1 overflow-y-auto p-3 md:p-4 scrollbar-thin scrollbar-thumb-pink-600 scrollbar-track-transparent scroll-fix"
        ref={chatContainerRef}
        id="chat-container"
        style={{
          scrollBehavior: "smooth",
          height: "100%",
        }}
      >
        <div className="max-w-5xl mx-auto w-full px-8">
          {isLoading ? (
            <LoadingIndicator />
          ) : messages.length === 0 && activeChat ? (
            <EmptyChat focusInputField={focusInputField} />
          ) : (
            <MessageList messages={messages} />
          )}

          {isTyping && <TypingIndicator />}

          <div
            ref={endOfMessagesRef}
            className="h-2 scroll-fix"
            id="end-of-messages"
          />
        </div>
      </div>

      {showScrollButton && (
        <ScrollToBottomButton onClick={scrollToBottomManually} />
      )}

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-5px) translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatArea;
