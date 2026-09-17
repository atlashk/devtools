import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: true });

/** Converts a Markdown string into sanitized HTML safe for direct rendering. */
export function markdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false });
  return DOMPurify.sanitize(rawHtml);
}
