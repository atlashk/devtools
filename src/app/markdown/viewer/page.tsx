import type { Metadata } from "next";
import MarkdownViewerPage from "@/features/markdown/viewer-page";

export const metadata: Metadata = {
  title: "Markdown Viewer",
  description: "Write Markdown and preview the rendered output live.",
};

export default function Page() {
  return <MarkdownViewerPage />;
}
