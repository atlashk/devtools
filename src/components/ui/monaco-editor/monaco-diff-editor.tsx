"use client";

import { Button } from "@/components/ui/shadcn/button";
import { DiffEditor } from "@monaco-editor/react";
import { Code, Copy, Search } from "lucide-react";
import { useRef, useState } from "react";

export interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  onOriginalChange?: (value: string) => void;
  onModifiedChange?: (value: string) => void;
  className?: string;
  readOnly?: boolean;
  originalReadOnly?: boolean;
  modifiedReadOnly?: boolean;
  lang?: string; // Language identifier (json, javascript, python, etc.)
  height?: string;
  showSearchButton?: boolean; // Enable/disable search button
  showCopyButton?: boolean; // Enable/disable copy button
  showFormatButton?: boolean; // Enable/disable format button
}

export function MonacoDiffEditor({
  original,
  modified,
  onOriginalChange,
  onModifiedChange,
  className = "",
  readOnly = false,
  originalReadOnly = false,
  modifiedReadOnly = false,
  lang = "plaintext",
  height = "100%",
  showSearchButton = true,
  showCopyButton = true,
  showFormatButton = true,
}: MonacoDiffEditorProps) {
  const editorRef = useRef<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Set up change handlers if provided
    if (onOriginalChange) {
      const originalEditor = editor.getOriginalEditor();
      originalEditor.onDidChangeModelContent(() => {
        onOriginalChange(originalEditor.getValue());
      });
    }
    
    if (onModifiedChange) {
      const modifiedEditor = editor.getModifiedEditor();
      // Apply modifiedReadOnly setting manually since modifiedEditable option doesn't exist
      if (modifiedReadOnly && !readOnly) {
        modifiedEditor.updateOptions({ readOnly: true });
      }
      modifiedEditor.onDidChangeModelContent(() => {
        onModifiedChange(modifiedEditor.getValue());
      });
    }
  };

  const handleSearch = () => {
    if (editorRef.current) {
      const modifiedEditor = editorRef.current.getModifiedEditor();
      modifiedEditor.focus();
      modifiedEditor.getAction('actions.find').run();
    }
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      const modifiedEditor = editorRef.current.getModifiedEditor();
      const value = modifiedEditor.getValue();
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleFormat = () => {
    if (editorRef.current) {
      const modifiedEditor = editorRef.current.getModifiedEditor();
      modifiedEditor.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className={`relative flex flex-col ${className}`} style={{ height }}>
      {/* Header with actions */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="text-xs text-muted-foreground">
          {lang.toUpperCase()} DIFF
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
              className="h-7 w-7"
              onClick={handleCopy}
              title="Copy modified content to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
              {copySuccess && (
                <span className="absolute -top-8 right-0 bg-background text-foreground text-xs py-1 px-2 rounded shadow-md">
                  Copied!
                </span>
              )}
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

      {/* Monaco Diff Editor */}
      <div className="flex-1 min-h-0">
        <DiffEditor
          height="100%"
          language={lang}
          original={original}
          modified={modified}
          options={{
            readOnly: readOnly,
            originalEditable: !readOnly && !originalReadOnly,
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
            renderSideBySide: true,
            diffWordWrap: "on",
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}