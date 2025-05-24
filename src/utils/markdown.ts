import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import "../styles/code.css";
import DOMPurify from "dompurify";

declare module "marked" {
  interface MarkedOptions {
    highlight?(code: string, lang?: string): string;
    headerIds?: boolean;
    langPrefix?: string;
    renderer?: InstanceType<typeof marked.Renderer> | null;
    gfm?: boolean;
    breaks?: boolean;
  }
}

const MAX_INPUT_LENGTH = 100000;
const MAX_CODE_BLOCK_LENGTH = 10000;
const BATCH_SIZE = 10;
const DEBOUNCE_DELAY = 100;

const SUPPORTED_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "python",
  "ruby",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "php",
  "rust",
  "swift",
  "kotlin",
  "sql",
  "bash",
  "json",
  "xml",
  "yaml",
  "markdown",
  "graphql",
  "html",
  "css",
  "plaintext",
]);

const sanitizeCode = (code: string): string => {
  if (code.length > MAX_CODE_BLOCK_LENGTH) {
    return code.slice(0, MAX_CODE_BLOCK_LENGTH) + "\n// ... (код обрезан)";
  }
  return code;
};

const validateLanguage = (lang: string): string => {
  const normalizedLang = lang.toLowerCase();
  return SUPPORTED_LANGUAGES.has(normalizedLang) ? normalizedLang : "plaintext";
};

const processCodeBlock = (
  htmlBlock: HTMLElement,
  preBlock: HTMLElement
): void => {
  if (htmlBlock.dataset.highlighted) return;

  try {
    hljs.highlightElement(htmlBlock);
    htmlBlock.dataset.highlighted = "true";

    if (!preBlock.classList.contains("code-block-container")) {
      preBlock.classList.add("code-block-container");
    }

    if (!preBlock.querySelector(".copy-btn")) {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "⧉";
      copyBtn.setAttribute("title", "Скопировать код");
      copyBtn.setAttribute(
        "data-code",
        encodeURIComponent(htmlBlock.textContent || "")
      );
      preBlock.appendChild(copyBtn);
    }

    if (!preBlock.querySelector(".code-lang-label")) {
      const langClass = Array.from(htmlBlock.classList).find((c) =>
        c.startsWith("language-")
      );
      const lang = langClass
        ? validateLanguage(langClass.replace("language-", ""))
        : "plaintext";
      const langLabel = document.createElement("span");
      langLabel.className = "code-lang-label";
      langLabel.textContent = getLanguageDisplay(lang);
      preBlock.appendChild(langLabel);
    }
  } catch (error) {
    console.error("Error processing code block:", error);
  }
};

export const renderMarkdownSafe = (text: string): string => {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (text.length > MAX_INPUT_LENGTH) {
    return DOMPurify.sanitize(
      "⚠️ Текст слишком длинный. Максимальная длина: " + MAX_INPUT_LENGTH
    );
  }

  try {
    const processedText = text.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (match: string, lang: string, code: string) => {
        const language = validateLanguage(lang);
        const sanitizedCode = sanitizeCode(code);
        return `\`\`\`${language}\n${sanitizedCode}\`\`\``;
      }
    );

    const renderer = new marked.Renderer();
    renderer.code = ({
      text,
      lang,
      escaped,
    }: {
      text: string;
      lang?: string;
      escaped?: boolean;
    }) => {
      const language = validateLanguage(lang || "plaintext");
      const sanitizedText = sanitizeCode(text);
      const codeToUse = escaped
        ? sanitizedText
        : encodeURIComponent(sanitizedText);

      let highlightedCode: string;
      try {
        highlightedCode = hljs.highlight(sanitizedText, {
          language,
        }).value;
      } catch {
        highlightedCode = sanitizedText;
      }

      return `
        <pre class="code-block-container">
          <button class="copy-btn" data-code="${codeToUse}" title="Скопировать код">⧉</button>
          <span class="code-lang-label">${getLanguageDisplay(language)}</span>
          <code class="hljs language-${language}">
            ${highlightedCode}
          </code>
        </pre>
      `;
    };

    marked.setOptions({
      renderer,
      highlight: (code: string, lang?: string) => {
        const language = validateLanguage(lang || "plaintext");
        try {
          return language && hljs.getLanguage(language)
            ? hljs.highlight(sanitizeCode(code), { language }).value
            : hljs.highlightAuto(sanitizeCode(code)).value;
        } catch {
          return sanitizeCode(code);
        }
      },
      gfm: true,
      breaks: true,
      headerIds: false,
      langPrefix: "language-",
    });

    const html = marked.parse(processedText, { async: false }) as string;
    const processedHtml = html.replace(/<code>/g, '<code class="inline-code">');

    return DOMPurify.sanitize(processedHtml, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
        "img",
        "span",
        "button",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "class", "title", "data-code"],
    });
  } catch (error) {
    console.error("Error rendering markdown:", error);
    return DOMPurify.sanitize(text);
  }
};

export const getLanguageDisplay = (lang: string): string => {
  const languageMap: { [key: string]: string } = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    py: "Python",
    python: "Python",
    rb: "Ruby",
    java: "Java",
    c: "C",
    cpp: "C++",
    cs: "C#",
    csharp: "C#",
    go: "Go",
    php: "PHP",
    rust: "Rust",
    swift: "Swift",
    kotlin: "Kotlin",
    sql: "SQL",
    bash: "Bash",
    sh: "Shell",
    json: "JSON",
    xml: "XML",
    yml: "YAML",
    yaml: "YAML",
    md: "Markdown",
    markdown: "Markdown",
    graphql: "GraphQL",
    html: "HTML",
    css: "CSS",
    plaintext: "Plain Text",
  };

  return languageMap[lang.toLowerCase()] || lang.toUpperCase();
};

const processingQueue: HTMLElement[] = [];
let isProcessing = false;
let debounceTimer: number | null = null;

const processQueue = (): void => {
  if (isProcessing || !processingQueue.length) return;

  isProcessing = true;
  const batch = processingQueue.splice(0, BATCH_SIZE);

  batch.forEach((container) => {
    container.querySelectorAll("pre code").forEach((block) => {
      const htmlBlock = block as HTMLElement;
      const preBlock = htmlBlock.parentElement;
      if (preBlock) {
        processCodeBlock(htmlBlock, preBlock);
      }
    });
  });

  isProcessing = false;

  if (processingQueue.length) {
    requestAnimationFrame(processQueue);
  }
};

const debouncedProcessQueue = (): void => {
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
  }
  debounceTimer = window.setTimeout(processQueue, DEBOUNCE_DELAY);
};

export const applyHighlightToExistingCodeBlocks = (): void => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            processingQueue.push(node);
            debouncedProcessQueue();
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  const initialBlocks = document.querySelectorAll("pre code");
  initialBlocks.forEach((block) => {
    const htmlBlock = block as HTMLElement;
    const preBlock = htmlBlock.parentElement;
    if (preBlock) {
      processCodeBlock(htmlBlock, preBlock);
    }
  });
};
