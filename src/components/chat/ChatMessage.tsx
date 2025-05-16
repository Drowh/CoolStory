import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import cat from "../../assets/icons/cat.png";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/vs2015.css";
import { renderMarkdownSafe } from "../../utils/markdown";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  imageUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    hljs.registerLanguage("javascript", javascript);
    hljs.registerLanguage("typescript", typescript);
    hljs.registerLanguage("python", python);
    hljs.registerLanguage("bash", bash);
    hljs.registerLanguage("json", json);

    hljs.configure({
      ignoreUnescapedHTML: true,
    });
  }, []);

  useEffect(() => {
    if (!isUser) {
      try {
        const processedHtml = renderMarkdownSafe(message.text);
        setHtml(processedHtml);

        setTimeout(() => {
          document.querySelectorAll("pre code").forEach((block) => {
            const htmlBlock = block as HTMLElement;
            if (!htmlBlock.dataset.highlighted) {
              hljs.highlightElement(htmlBlock);
            }
          });
        }, 100);
      } catch (error) {
        console.error("Markdown parsing error:", error);
        setHtml(`<p>${message.text}</p>`);
      }
    }
  }, [message.text, isUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("copy-btn")) {
        const code = decodeURIComponent(target.getAttribute("data-code") || "");
        navigator.clipboard.writeText(code);
        target.textContent = "✓";
        setTimeout(() => (target.textContent = "⧉"), 1200);
      }
    };

    if (!isUser) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [html, isUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={`flex ${
        isUser
          ? "flex-col items-end md:flex-row"
          : "flex-col items-start md:flex-row"
      } my-0.5 w-full`}
    >
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 mb-3 ml-2 md:mt-0 flex items-center justify-center shadow-md order-1 md:order-2">
          <FontAwesomeIcon icon="user" className="text-white text-sm" />
        </div>
      )}

      <div
        className={`relative py-1 rounded-lg leading-relaxed break-words whitespace-pre-wrap order-2 md:order-1
          ${
            isUser
              ? "text-base px-3 font-normal max-w-2xl bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 shadow-md"
              : "text-base font-normal w-full text-gray-100 chat-message-assistant px-2"
          }`}
      >
        {message.imageUrl && (
          <Image
            src={message.imageUrl}
            alt="Attached"
            className="rounded-lg mb-2"
            width={200}
            height={200}
            style={{ maxWidth: "200px", height: "auto" }}
          />
        )}
        {isUser ? (
          <div className="flex items-center justify-between">
            <p className="mb-0 flex-1 mr-1">{message.text}</p>
            <button
              className="copy-btn-msg -mr-2"
              title="Скопировать сообщение"
              onClick={handleCopy}
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        ) : (
          <>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <button
              className="copy-btn-msg"
              title="Скопировать сообщение"
              onClick={handleCopy}
            >
              {copied ? "✓" : "⧉"}
            </button>
          </>
        )}
      </div>

      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 md:mb-0 flex items-center justify-center shadow-md overflow-hidden">
          <Image
            src={cat}
            alt="Assistant"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
