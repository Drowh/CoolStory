import React, { useEffect, useRef, useState } from "react";
import { useMessageStore } from "../../stores/messageStore";
import { useChatHistoryStore } from "../../stores/chatHistoryStore";
import { useModalStore } from "../../stores/modalStore";
import ChatMessage from "./ChatMessage";
import LoadingIndicator from "./LoadingIndicator";
import Image from "next/image";
import cat from "../../assets/icons/cat.png";

const ChatArea: React.FC = () => {
  const { messages, isTyping, setMessagesEndRef, focusInputField } =
    useMessageStore();
  const { chatHistory, loadingChatId } = useChatHistoryStore();
  const { setModalType } = useModalStore();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);

  useEffect(() => {
    setMessagesEndRef(endOfMessagesRef);
  }, [setMessagesEndRef]);

  const scrollToBottomManually = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeIn(true);
      scrollToBottomManually();
    }, 100);

    return () => clearTimeout(fadeTimer);
  }, []);

  const checkScroll = () => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    lastScrollPositionRef.current = container.scrollTop;

    if (distanceFromBottom > 30) {
      setShowScrollButton(true);

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      scrollTimerRef.current = setTimeout(() => {
        if (chatContainerRef.current) {
          const newDistanceFromBottom =
            chatContainerRef.current.scrollHeight -
            chatContainerRef.current.scrollTop -
            chatContainerRef.current.clientHeight;

          if (newDistanceFromBottom <= 30) {
            setShowScrollButton(false);
          }
        }
      }, 2000);
    } else {
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkScroll();
    };

    container.addEventListener("scroll", handleScroll);

    const observer = new MutationObserver(() => {
      setTimeout(handleScroll, 100);
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [messages]);

  const activeChat = chatHistory.find((chat) => chat.isActive);
  const isLoading =
    loadingChatId !== null && activeChat && activeChat.id === loadingChatId;

  useEffect(() => {
    if (activeChat) {
      focusInputField();
    }
  }, [activeChat, focusInputField]);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      const timer = setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [activeChat]);

  const openAuthModal = () => {
    setModalType("auth");
  };

  if (!activeChat && chatHistory.length === 0) {
    return (
      <div className="flex-1 mt-6 mx-2 flex flex-col items-center justify-center text-gray-400 transition-all duration-500 opacity-90 hover:opacity-100">
        <div
          onClick={openAuthModal}
          className="p-8 rounded-xl bg-gray-800 bg-opacity-50 shadow-2xl transform transition-transform duration-300 hover:scale-105 max-w-md w-full mx-4 backdrop-blur-sm cursor-pointer"
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
      className={`relative flex flex-col transition-all duration-500  ${
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
                <Image
                  src={cat}
                  alt="Assistant"
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
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
          <div
            ref={endOfMessagesRef}
            className="h-2 scroll-fix"
            id="end-of-messages"
          />
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottomManually}
          className="scroll-to-bottom fixed bottom-[160px] md:bottom-[145px] left-1/2 transform -translate-x-1/2 w-[35px] h-[35px] md:w-[40px] md:h-[40px] rounded-full bg-gradient-to-r from-pink-600/70 to-purple-700/70 text-white text-lg md:text-xl flex items-center justify-center border border-white/50 shadow-lg z-50 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:opacity-100"
          style={{
            boxShadow: "0 3px 10px rgba(219, 39, 119, 0.4)",
            animation: "bounce 2s infinite ease-in-out",
            opacity: 0.7,
          }}
          aria-label="Прокрутить вниз"
        >
          ↓
        </button>
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
