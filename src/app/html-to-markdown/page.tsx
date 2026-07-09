import type { Metadata } from "next";
import HtmlToMarkdownPage from "@/features/html-to-markdown/html-to-markdown-page";

export const metadata: Metadata = {
  title: "HTML to Markdown",
  description: "Convert raw HTML or a live URL into Markdown.",
};

export default function Page() {
  return <HtmlToMarkdownPage />;
}
