export type ElementSelectorType = "id" | "class";

export interface ElementSelector {
  type: ElementSelectorType;
  value: string;
}

/**
 * Pulls a single element's outerHTML out of a full HTML document by id or
 * class name, so only that subtree gets converted to Markdown. If several
 * elements share the class, the first match is used.
 */
export function extractElementHtml(
  html: string,
  selector: ElementSelector
): string {
  // Class attributes are often several space-separated tokens (e.g. copied
  // straight from devtools) — treat them as a compound "must have all"
  // class selector rather than one literal (invalid) class name.
  const tokens = selector.value
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^[.#]/, ""))
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new Error("Please provide an id or class name");
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const query =
    selector.type === "id"
      ? `#${CSS.escape(tokens[0])}`
      : tokens.map((token) => `.${CSS.escape(token)}`).join("");
  const element = doc.querySelector(query);

  if (!element) {
    throw new Error(
      selector.type === "id"
        ? `No element found with id "${tokens[0]}"`
        : `No element found with class "${tokens.join(" ")}"`
    );
  }

  return element.outerHTML;
}
