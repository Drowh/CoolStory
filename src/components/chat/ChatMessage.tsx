import React, { useState, useEffect } from "react";
import Image from "next/image";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/vs2015.css";
import "highlight.js/styles/vs.css";
import { renderMarkdownSafe } from "../../utils/markdown";
import { useProfile } from "../../contexts/ProfileContext";
import Avatar from "../ui/Avatar";
import "../../styles/markdown.css";
import "../../styles/chat.css";
import DOMPurify from "dompurify";

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
  const { avatarId } = useProfile();

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
        const isHtmlCode =
          message.text.trim().startsWith("<") &&
          message.text.trim().endsWith(">");

        let processedHtml;
        if (isHtmlCode) {
          processedHtml = `
            <pre class="code-block-container language-html">
              <button class="copy-btn" data-code="${encodeURIComponent(
                message.text
              )}" title="Скопировать код">⧉</button>
              <span class="code-lang-label">HTML</span>
              <code class="hljs language-html">
                ${DOMPurify.sanitize(message.text)}
              </code>
            </pre>
          `;
        } else {
          processedHtml = renderMarkdownSafe(message.text);
        }

        setHtml(processedHtml);
      } catch (error) {
        console.error("Markdown parsing error:", error);
        setHtml(`<p>${DOMPurify.sanitize(message.text)}</p>`);
      }
    }
  }, [message.text, isUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("copy-btn")) {
        const code = decodeURIComponent(target.getAttribute("data-code") || "");
        navigator.clipboard.writeText(code).catch(console.error);
        target.textContent = "✓";
        const timeoutId = setTimeout(() => (target.textContent = "⧉"), 1200);
        return () => clearTimeout(timeoutId);
      }
    };

    if (!isUser) {
      document.addEventListener("click", handler);
      return () => {
        document.removeEventListener("click", handler);
      };
    }
  }, [isUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).catch(console.error);
    setCopied(true);
    const timeoutId = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timeoutId);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    console.error("Ошибка загрузки изображения:", message.imageUrl);
  };

  return (
    <div
      className={`flex ${
        isUser
          ? "flex-col items-end md:flex-row"
          : "flex-col items-start md:flex-row"
      } my-2 w-full`}
      role="article"
      aria-label={`Сообщение от ${isUser ? "пользователя" : "ассистента"}`}
    >
      {isUser && (
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full mb-3 ml-2 md:mt-0 flex items-center justify-center shadow-md order-1 md:order-2"
          aria-hidden="true"
        >
          <Avatar avatarId={avatarId} size="md" />
        </div>
      )}

      <div
        className={`relative py-2 px-3 rounded-lg leading-relaxed break-words whitespace-pre-wrap order-2 md:order-1 shadow-sm
          ${
            isUser
              ? "text-base font-normal max-w-2xl bg-gradient-to-r from-blue-50 to-blue-100 text-zinc-900 dark:from-gray-800 dark:to-gray-700 dark:text-gray-100"
              : "text-base font-normal w-full text-zinc-900 dark:text-gray-100"
          }`}
      >
        {message.imageUrl && (
          <div className="relative w-[200px] h-[200px] mb-2">
            <Image
              src={message.imageUrl}
              alt="Прикрепленное изображение"
              className="rounded-lg object-contain"
              fill
              sizes="200px"
              priority
              loading="eager"
              onError={handleImageError}
            />
          </div>
        )}
        {isUser ? (
          <div className="flex items-center justify-between">
            <p className="mb-0 flex-1 mr-1">{message.text}</p>
            <button
              className="copy-btn-msg -mr-2 text-zinc-600 hover:text-zinc-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              title="Скопировать сообщение"
              onClick={handleCopy}
              aria-label={
                copied ? "Сообщение скопировано" : "Скопировать сообщение"
              }
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        ) : (
          <>
            <div
              className="markdown-content max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
              aria-label="Сообщение ассистента"
            />
            <button
              className="copy-btn-msg text-zinc-600 hover:text-zinc-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
              title="Скопировать сообщение"
              onClick={handleCopy}
              aria-label={
                copied ? "Сообщение скопировано" : "Скопировать сообщение"
              }
            >
              {copied ? "✓" : "⧉"}
            </button>
          </>
        )}
      </div>

      {!isUser && (
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full md:mb-0 flex items-center justify-center shadow-md overflow-hidden"
          aria-hidden="true"
        >
          <Image
            src="/assets/icons/cat.png"
            alt="Аватар ассистента"
            className="w-full h-full object-cover"
            width={40}
            height={40}
            priority
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
