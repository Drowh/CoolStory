import React, { useEffect, useRef, useState } from "react";
import { useMessageStore } from "../../stores/messageStore";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useModalStore } from "../../stores/modalStore"; 
import ChatMessage from "./ChatMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ChatArea: React.FC = () => {
  const {
    messages,
    isTyping,
    setMessagesEndRef,
    scrollToBottom,
    focusInputField,
  } = useMessageStore();
  const { chatHistory } = useChatHistoryStore();
  const { setModalType } = useModalStore(); 
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [scrollTimeout, setScrollTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    setMessagesEndRef(endOfMessagesRef);
  }, [setMessagesEndRef]);

  useEffect(() => {
    scrollToBottom();

    const fadeTimer = setTimeout(() => {
      setFadeIn(true);
    }, 100);

    return () => clearTimeout(fadeTimer);
  }, [scrollToBottom]);

  useEffect(() => {
    const checkScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    const handleScroll = () => {
      setIsScrolling(true);
      checkScroll();

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      const newScrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);

      setScrollTimeoutId(newScrollTimeout);
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      checkScroll();

      return () => {
        chatContainer.removeEventListener("scroll", handleScroll);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    }
  }, [messages, scrollTimeout]);

  const activeChat = chatHistory.find((chat) => chat.isActive);

  useEffect(() => {
    if (activeChat) {
      focusInputField();
    }
  }, [activeChat, focusInputField]);

  const openAuthModal = () => {
    setModalType("auth");
  };

  if (!activeChat) {
    return (
      <div className="flex-1 mt-6 mx-2 flex flex-col items-center justify-center text-gray-400 transition-all duration-500 opacity-90 hover:opacity-100">
        <div
          onClick={openAuthModal} 
          className="p-8 rounded-xl bg-gray-800 bg-opacity-50 shadow-2xl transform transition-transform duration-300 hover:scale-105 max-w-md w-full mx-4 backdrop-blur-sm cursor-pointer" // Добавлен cursor-pointer
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-6 text-gray-600 animate-float"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-center text-xl mb-3 font-light bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Добро пожаловать в чат <br />
            CoolStory Beberony
          </p>
          <p className="text-center text-sm text-gray-600">
            Авторизуйтесь перед тем, как начать диалог.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full transition-all duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex-1 overflow-y-auto p-3 md:p-4 scrollbar-thin scrollbar-thumb-pink-600 scrollbar-track-transparent ${
          isScrolling ? "scroll-smooth" : ""
        }`}
        ref={chatContainerRef}
      >
        <div className="max-w-5xl mx-auto w-full px-8">
          {messages.length === 0 ? (
            <div
              onClick={focusInputField}
              className="flex flex-col cursor-pointer items-center justify-center h-64 text-gray-500 transition-all duration-500 transform hover:scale-105"
            >
              <div className="p-6 rounded-lg bg-gray-800 bg-opacity-40 shadow-lg transform hover:shadow-pink-500/10 transition-all duration-300">
                <p className="mb-2 text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
                  Начните ваш диалог
                </p>
                <p className="text-sm text-gray-500">
                  Задайте мне вопрос, и я постараюсь помочь
                </p>
              </div>
            </div>
          ) : (
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
          )}

          {isTyping && (
            <div className="flex items-start mt-4 w-full">
              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 border border-gray-700 mr-3 flex items-center justify-center shadow-md overflow-hidden">
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse opacity-50"></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-lg text-gray-300 shadow-md">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} className="h-4" />
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute right-4 sm:right-6 md:right-8 bottom-20 md:bottom-24 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10 animate-bounce-slow"
          aria-label="Прокрутить вниз"
        >
          <FontAwesomeIcon icon="chevron-down" />
        </button>
      )}
    </div>
  );
};

export default ChatArea;
