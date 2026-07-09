"use client";

import { Button } from "@/components/ui/shadcn/button";
import Editor from "@monaco-editor/react";
import { Code, Copy, Search, Trash2 } from "lucide-react";
import { ReactNode, useRef, useState } from "react";

export interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  lang?: string; // Language identifier (json, javascript, python, etc.)
  height?: string;
  autoFormat?: boolean;
  showSearchButton?: boolean; // Enable/disable search button
  showCopyButton?: boolean; // Enable/disable copy button
  showClearButton?: boolean; // Enable/disable clear button
  showFormatButton?: boolean; // Enable/disable format button
  toolbarActions?: ReactNode; // Custom actions rendered on the left of the header
}

export function MonacoEditor({
  value,
  onChange = () => { },
  className = "",
  readOnly = false,
  lang = "json",
  height = "100%",
  autoFormat = true,
  showSearchButton = true,
  showCopyButton = true,
  showClearButton = true,
  showFormatButton = true,
  toolbarActions,
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleSearch = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.getAction('actions.find').run();
    }
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.setValue("");
      onChange("");
    }
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className={`relative flex flex-col ${className}`} style={{ height }}>
      {/* Header with actions */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {lang.toUpperCase()}
          </span>
          {toolbarActions}
        </div>
        <div className="flex items-center">
          {showSearchButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSearch}
              title="Search in content (Ctrl+F)"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          )}
          {showCopyButton && (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-7 w-7"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
              {copySuccess && (
                <span className="absolute top-full right-0 mt-1 z-10 bg-background text-foreground text-xs py-1 px-2 rounded shadow-md border whitespace-nowrap">
                  Copied!
                </span>
              )}
            </Button>
          )}
          {showClearButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleClear}
              title="Clear content"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {showFormatButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleFormat}
              title="Format code"
            >
              <Code className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage={lang}
          value={value}
          onChange={(value) => onChange(value || "")}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            lineNumbers: "on",
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
            },
            wordWrap: "on",
            formatOnPaste: autoFormat,
            formatOnType: autoFormat,
            autoIndent: "advanced",
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
