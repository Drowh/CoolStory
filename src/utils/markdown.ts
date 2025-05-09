import { marked } from "marked";
import hljs from "highlight.js";

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

export const renderMarkdownSafe = (text: string): string => {
  try {
    const processedText = text.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (match: string, lang: string, code: string) => {
        const language = lang || "plaintext";
        return `\`\`\`${language}\n${code}\`\`\``;
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
      const language = lang || "plaintext";
      const codeToUse = escaped ? text : encodeURIComponent(text);
      const highlightedCode = hljs.highlight(text, {
        language: language || "plaintext",
      }).value;

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
        const language = lang || "";
        try {
          return language && hljs.getLanguage(language)
            ? hljs.highlight(code, { language }).value
            : hljs.highlightAuto(code).value;
        } catch (error) {
          console.error("Highlight error:", error);
          return code;
        }
      },
      gfm: true,
      breaks: true,
      headerIds: false,
      langPrefix: "language-",
    });

    const html = marked.parse(processedText, { async: false }) as string;

    const processedHtml = html.replace(/<code>/g, '<code class="inline-code">');

    return processedHtml;
  } catch (error) {
    console.error("Error rendering markdown:", error);
    return text;
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

export const applyHighlightToExistingCodeBlocks = (): void => {
  setTimeout(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      const htmlBlock = block as HTMLElement;
      const preBlock = htmlBlock.parentElement;

      if (!htmlBlock.dataset.highlighted) {
        hljs.highlightElement(htmlBlock);

        if (preBlock && !preBlock.classList.contains("code-block-container")) {
          preBlock.classList.add("code-block-container");
        }

        if (preBlock && !preBlock.querySelector(".copy-btn")) {
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

        if (preBlock && !preBlock.querySelector(".code-lang-label")) {
          const langClass = Array.from(htmlBlock.classList).find((c) =>
            c.startsWith("language-")
          );
          const lang = langClass
            ? langClass.replace("language-", "")
            : "plaintext";
          const langLabel = document.createElement("span");
          langLabel.className = "code-lang-label";
          langLabel.textContent = getLanguageDisplay(lang);
          preBlock.appendChild(langLabel);
        }
      }
    });
  }, 100);
};
