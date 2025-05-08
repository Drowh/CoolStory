import { marked } from "marked";
import DOMPurify from "dompurify";

export async function renderMarkdownSafe(markdown: string): Promise<string> {
  const html = await marked(markdown);
  return DOMPurify.sanitize(html);
}
