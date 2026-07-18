"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { MonacoEditor } from "@/components/ui/monaco-editor/monaco-editor";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { ElementSelectorFields } from "./components/element-selector-fields";
import {
  extractElementHtml,
  type ElementSelectorType,
} from "./utils/extract-element";
import { htmlToMarkdown } from "./utils/html-to-markdown";

export default function HtmlToMarkdownPage() {
  const { handleError } = useErrorHandler();

  const [htmlInput, setHtmlInput] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [selectorEnabled, setSelectorEnabled] = useState(false);
  const [selectorType, setSelectorType] = useState<ElementSelectorType>("id");
  const [selectorValue, setSelectorValue] = useState("");

  const handleConvert = () => {
    if (!htmlInput.trim()) {
      handleError(new Error("Please enter some HTML"), "Convert to Markdown");
      return;
    }
    try {
      const source = selectorEnabled
        ? extractElementHtml(htmlInput, { type: selectorType, value: selectorValue })
        : htmlInput;
      setMarkdown(htmlToMarkdown(source));
    } catch (err) {
      handleError(err, "Convert to Markdown");
    }
  };

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
                  <BreadcrumbPage>HTML to Markdown</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-3 overflow-hidden max-w-full">
          <ElementSelectorFields
            id="html-extract-element"
            enabled={selectorEnabled}
            onEnabledChange={setSelectorEnabled}
            type={selectorType}
            onTypeChange={setSelectorType}
            value={selectorValue}
            onValueChange={setSelectorValue}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
            <MonacoEditor
              value={htmlInput}
              onChange={setHtmlInput}
              lang="html"
              className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
              toolbarActions={
                <Button
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleConvert}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Convert
                </Button>
              }
            />
            <MonacoEditor
              value={markdown}
              lang="markdown"
              readOnly
              showFormatButton={false}
              className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
            />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
