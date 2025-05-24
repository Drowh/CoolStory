import React, { useEffect, useState } from "react";
import { useMessageStore } from "../../../stores/messageStore";
import { useChatHistoryStore } from "../../../stores/chatHistory";
import { useModalStore } from "../../../stores/modalStore";
import { supabase } from "../../../utils/supabase";
import LoadingIndicator from "../LoadingIndicator";
import useScrollManagement from "../../../hooks/chat-area/useScrollManagement";
import {
  WelcomeScreen,
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
      ref={chatContainerRef}
      className={`flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
      role="log"
      aria-label="История сообщений"
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <MessageList messages={messages} />
          {isTyping && <TypingIndicator />}
          <div ref={endOfMessagesRef} />
          {showScrollButton && (
            <ScrollToBottomButton onClick={scrollToBottomManually} />
          )}
        </>
      )}
    </div>
  );
};

export default ChatArea;
