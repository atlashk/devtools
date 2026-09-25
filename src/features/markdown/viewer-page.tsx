"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { MonacoEditor } from "@/components/ui/monaco-editor/monaco-editor";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useEffect, useState } from "react";
import { markdownToHtml } from "./utils/markdown-to-html";

const DEFAULT_MARKDOWN = `# Markdown Viewer

Type or paste **Markdown** on the left to see it rendered on the right.

- Supports GitHub-flavored Markdown
- Live preview as you type

\`\`\`js
console.log("Hello, Markdown!");
\`\`\`
`;

export default function MarkdownViewerPage() {
  const { handleError } = useErrorHandler();
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [html, setHtml] = useState("");

  useEffect(() => {
    try {
      setHtml(markdownToHtml(markdown));
    } catch (err) {
      handleError(err, "Render Markdown");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Markdown Viewer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-3 overflow-hidden max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
            <MonacoEditor
              value={markdown}
              onChange={setMarkdown}
              lang="markdown"
              className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
            />
            <div className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-auto p-4">
              <div
                className="markdown-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
