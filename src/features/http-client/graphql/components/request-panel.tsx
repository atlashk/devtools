"use client";

import { Button } from "@/components/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn/tabs";
import { MonacoEditor } from "@/components/ui/monaco-editor/monaco-editor";
import { Save, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { KeyValueEditor } from "../../shared/components/key-value-editor";
import { GraphQLRequest } from "../types/graphql.types";

interface RequestPanelProps {
  request: GraphQLRequest;
  onSend: () => void;
  onSave: () => void;
  onUpdateRequest: (updatedRequest: GraphQLRequest) => void;
  isLoading: boolean;
}

export function RequestPanel({
  request,
  onSend,
  onSave,
  onUpdateRequest,
  isLoading,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState("query");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [requestName, setRequestName] = useState(request.name || "");

  // Resizable height for the query/variables/headers area (null = auto height)
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = contentRef.current?.offsetHeight ?? 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(160, startHeight + (moveEvent.clientY - startY));
      setContentHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    setRequestName(request.name || "");
  }, [request.name]);

  const handleConfirmSave = () => {
    const name = requestName.trim();
    if (!name) return;
    onUpdateRequest({ ...request, name });
    setShowSaveDialog(false);
    onSave();
  };

  return (
    <div className="space-y-4">
      {/* Endpoint + actions */}
      <div className="flex gap-2">
        <div className="flex w-20 items-center justify-center rounded-md border bg-pink-500/10 text-sm font-semibold text-pink-600">
          POST
        </div>
        <Input
          value={request.url}
          onChange={(e) => onUpdateRequest({ ...request, url: e.target.value })}
          placeholder="Enter GraphQL endpoint URL"
          className="flex-1"
        />
        <Button onClick={onSend} disabled={isLoading || !request.url.trim()}>
          <Send className="w-4 h-4" />
          {isLoading ? "Sending..." : "Send"}
        </Button>
        <Button onClick={() => setShowSaveDialog(true)} variant="outline">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Save Request Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="graphql-request-name" className="text-right">
                Name
              </Label>
              <Input
                id="graphql-request-name"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                className="col-span-3"
                placeholder="Enter request name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmSave();
                  else if (e.key === "Escape") setShowSaveDialog(false);
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={!requestName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Query / Variables / Headers */}
      <div
        ref={contentRef}
        className="flex flex-col min-h-0"
        style={contentHeight ? { height: contentHeight } : { height: 320 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1 overflow-y-auto">
            <TabsContent value="query" className="mt-0 h-full">
              <div className="h-full min-h-[8rem] overflow-hidden rounded-lg border">
                <MonacoEditor
                  value={request.query}
                  onChange={(query) => onUpdateRequest({ ...request, query })}
                  height="100%"
                  lang="graphql"
                  showFormatButton={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="variables" className="mt-0 h-full">
              <div className="h-full min-h-[8rem] overflow-hidden rounded-lg border">
                <MonacoEditor
                  value={request.variables}
                  onChange={(variables) =>
                    onUpdateRequest({ ...request, variables })
                  }
                  height="100%"
                  lang="json"
                />
              </div>
            </TabsContent>

            <TabsContent value="headers" className="mt-0">
              <KeyValueEditor
                items={request.headers}
                onChange={(headers) => onUpdateRequest({ ...request, headers })}
                placeholder={{
                  key: "Header",
                  value: "Value",
                  description: "Description",
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleResizeStart}
        className="group -mx-4 -mb-4 mt-2 flex h-3 cursor-ns-resize items-center justify-center"
        title="Drag to resize"
      >
        <div className="h-1 w-12 rounded-full bg-border transition-colors group-hover:bg-primary/60" />
      </div>
    </div>
  );
}
