import { useEffect, useRef, useState } from "react";
import { Message, Chat } from "../../types";

interface UseScrollManagementProps {
  messages: Message[];
  isTyping: boolean;
  activeChat: Chat | null;
  focusInputField: () => void;
}

export const useScrollManagement = ({
  messages,
  isTyping,
  activeChat,
  focusInputField,
}: UseScrollManagementProps) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPositionRef = useRef(0);

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

  return {
    endOfMessagesRef,
    chatContainerRef,
    fadeIn,
    showScrollButton,
    scrollToBottomManually,
  };
};

export default useScrollManagement;
