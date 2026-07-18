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
import { AlignLeft, Minimize2 } from "lucide-react";
import { useState } from "react";
import { useErrorHandler } from "@/hooks/use-error-handler";

export default function JsonFormatterPage() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  // Parse the current editor content, surfacing errors via toast + inline message.
  const parseInput = (): unknown | undefined => {
    if (!value.trim()) {
      const err = new Error("Please enter JSON to format");
      handleError(err, "JSON Formatting");
      setError(err.message);
      return undefined;
    }

    try {
      const parsed = JSON.parse(value);
      setError(null);
      return parsed;
    } catch (e) {
      handleError(e, "JSON Formatting");
      setError(e instanceof Error ? e.message : "Invalid JSON format");
      return undefined;
    }
  };

  // Pretty-print in place (2-space indent).
  const handleFormat = () => {
    const parsed = parseInput();
    if (parsed === undefined) return;
    setValue(JSON.stringify(parsed, null, 2));
  };

  // Collapse to a single compact line in place.
  const handleMinify = () => {
    const parsed = parseInput();
    if (parsed === undefined) return;
    setValue(JSON.stringify(parsed));
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>JSON Formatter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-2 overflow-hidden max-w-full">
          <MonacoEditor
            value={value}
            onChange={(next) => {
              setValue(next);
              setError(null);
            }}
            lang="json"
            autoFormat={false}
            showFormatButton={false}
            className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleFormat}
                  title="Format JSON (pretty-print)"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                  Format
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleMinify}
                  title="Minify JSON (single line)"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  Minify
                </Button>
              </>
            }
          />
          {error && <span className="text-sm text-red-500">{error}</span>}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
