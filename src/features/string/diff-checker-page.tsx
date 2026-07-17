"use client";

import { CheckCircle2, Edit, Eraser, FileText, Search } from "lucide-react";
import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { MonacoDiffEditor } from "@/components/ui/monaco-editor/monaco-diff-editor";
import { MonacoEditor } from "@/components/ui/monaco-editor/monaco-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";

function IdenticalNotice() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      The source and changed text are identical — no differences found.
    </div>
  );
}

interface DiffViewerProps {
  label: string;
  originalText: string;
  modifiedText: string;
}

function DiffViewer({ label, originalText, modifiedText }: DiffViewerProps) {
  const isIdentical = originalText === modifiedText;

  return (
    <div className="flex flex-col h-full">
      {isIdentical && <IdenticalNotice />}
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-gray-500" />
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      </div>
      <div className="flex-1 overflow-hidden rounded-lg">
        <MonacoDiffEditor
          original={originalText}
          modified={modifiedText}
          height="600px"
          readOnly={true}
          lang="plaintext"
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        />
      </div>
    </div>
  );
}

interface ActionButtonsProps {
  showDiff: boolean;
  onFindDiff: () => void;
  onEditAgain: () => void;
  onClear: () => void;
}

function ActionButtons({
  showDiff,
  onFindDiff,
  onEditAgain,
  onClear,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-center gap-2">
      {!showDiff ? (
        <>
          <Button
            onClick={onFindDiff}
            className="gap-2 px-4 py-2 text-sm"
          >
            <Search className="h-4 w-4" />
            Find differences
          </Button>
          <Button
            variant="outline"
            onClick={onClear}
            className="gap-2 px-4 py-2 text-sm"
          >
            <Eraser className="h-4 w-4" />
            Clear Inputs
          </Button>
        </>
      ) : (
        <Button
          onClick={onEditAgain}
          variant="outline"
          className="gap-2 px-4 py-2 text-sm"
        >
          <Edit className="h-4 w-4" />
          Edit again
        </Button>
      )}
    </div>
  );
}

// Main component
export default function DiffCheckerPage() {
  const [text1, setText1] = React.useState("");
  const [text2, setText2] = React.useState("");
  const [showDiff, setShowDiff] = React.useState(false);
  const { handleError } = useErrorHandler();

  const clear = React.useCallback(() => {
    setText1("");
    setText2("");
    setShowDiff(false);
  }, []);

  const handleFindDiff = React.useCallback(() => {
    try {
      setShowDiff(true);
    } catch (error) {
      handleError(error, "Computing differences");
      // Reset to input state if there's an error
      setShowDiff(false);
    }
  }, [handleError]);

  const handleEditAgain = React.useCallback(() => {
    setShowDiff(false);
  }, []);

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
                  <BreadcrumbPage>Diff Checker</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <div className="max-w-8xl mx-auto">
                {!showDiff ? (
                  <div className="flex flex-col h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Original text
                          </Label>
                        </div>
                        <div className="flex-1">
                          <MonacoEditor
                            value={text1}
                            onChange={setText1}
                            lang="plaintext"
                            height="600px"
                            className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Changed text
                          </Label>
                        </div>
                        <div className="flex-1">
                          <MonacoEditor
                            value={text2}
                            onChange={setText2}
                            lang="plaintext"
                            height="600px"
                            className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <ActionButtons
                        showDiff={showDiff}
                        onFindDiff={handleFindDiff}
                        onEditAgain={handleEditAgain}
                        onClear={clear}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <DiffViewer
                      label="Text Comparison"
                      originalText={text1}
                      modifiedText={text2}
                    />
                    <div className="mt-6">
                      <ActionButtons
                        showDiff={showDiff}
                        onFindDiff={handleFindDiff}
                        onEditAgain={handleEditAgain}
                        onClear={clear}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
