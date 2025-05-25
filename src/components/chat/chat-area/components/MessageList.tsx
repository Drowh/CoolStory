import React, { useEffect, useRef } from "react";
import ChatMessage from "../../ChatMessage";
import { Message } from "../../../../types";
import { processCodeBlock } from "../../../../utils/markdown";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageListRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              element
                .querySelectorAll(".markdown-content pre code.hljs")
                .forEach((codeBlock) => {
                  const preBlock = codeBlock.closest("pre");
                  if (preBlock) {
                    processCodeBlock(
                      codeBlock as HTMLElement,
                      preBlock as HTMLElement
                    );
                  }
                });
            }
          });
        }
      });
    });

    observer.observe(messageListRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [messages]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current
        .querySelectorAll(".markdown-content pre code.hljs")
        .forEach((codeBlock) => {
          const preBlock = codeBlock.closest("pre");
          if (preBlock) {
            processCodeBlock(codeBlock as HTMLElement, preBlock as HTMLElement);
          }
        });
    }
  }, []);

  return (
    <div ref={messageListRef} className="flex flex-col w-full space-y-4">
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
