import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

let service: TurndownService | null = null;

const LANGUAGE_CLASS_RE = /(?:^|\s)(?:language|lang)-(\S+)/;

/** Finds a `language-xxx` / `lang-xxx` class on a node or one of its descendants. */
function findLanguage(node: HTMLElement): string {
  const match =
    node.className.match(LANGUAGE_CLASS_RE) ||
    node.querySelector("[class*='language-'], [class*='lang-']")?.className.match(LANGUAGE_CLASS_RE);
  return match ? match[1] : "";
}

/**
 * Reads the rendered text of a code block, treating `<br>` as a line break.
 * Plain `textContent` drops `<br>` entirely, which collapses multi-line
 * snippets (e.g. highlight.js/Medium-style markup) onto a single line.
 */
function getCodeText(node: Node): string {
  let text = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.nodeValue;
    } else if (child.nodeName === "BR") {
      text += "\n";
    } else {
      text += getCodeText(child);
    }
  });
  return text;
}

function getTurndownService(): TurndownService {
  if (!service) {
    service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      emDelimiter: "_",
    });
    service.use(gfm);

    // Handles highlighted code blocks that don't fit turndown's default
    // `<pre><code>` assumption: syntax highlighters (e.g. Medium's editor)
    // often wrap tokens in `<span>` directly under `<pre>` with no `<code>`
    // element, and/or use `<br>` instead of newlines.
    service.addRule("highlightedPreBlock", {
      filter: "pre",
      replacement: (_content, node) => {
        const el = node as HTMLElement;
        const codeEl = el.querySelector("code") ?? el;
        const language = findLanguage(codeEl) || findLanguage(el);
        const code = getCodeText(codeEl).replace(/\n$/, "");

        let fence = "```";
        const fenceInCodeRegex = /^`{3,}/gm;
        let match;
        while ((match = fenceInCodeRegex.exec(code))) {
          if (match[0].length >= fence.length) {
            fence = "`".repeat(match[0].length + 1);
          }
        }

        return `\n\n${fence}${language}\n${code}\n${fence}\n\n`;
      },
    });
  }
  return service;
}

/** Converts an HTML string into GitHub-flavored Markdown. */
export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  return getTurndownService().turndown(trimmed);
}
