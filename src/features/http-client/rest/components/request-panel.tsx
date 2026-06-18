"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { useEffect, useRef, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn/tabs";
import { Save, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Label } from "@/components/ui/shadcn/label";
import { RestRequest } from "@/features/http-client/rest/types/rest.types";
import {
  buildUrlWithParams,
  parseCurl,
  parseUrlParams,
} from "@/features/http-client/rest/utils/utils";
import { KeyValueEditor } from "@/features/http-client/shared/components/key-value-editor";
import { RequestBodyViewer } from "./request-body-viewer";
import { HTTP_METHODS } from "@/constants";
import { getHttpMethodColor } from "@/utils/utils";

interface RequestPanelProps {
  request: RestRequest;
  onSend: () => void;
  onSave: () => void;
  onUpdateRequest: (updatedRequest: RestRequest) => void;
  isLoading: boolean;
}

export function RequestPanel({
  request,
  onSend,
  onSave,
  onUpdateRequest,
  isLoading,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState("params");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [requestName, setRequestName] = useState(request.name || "");

  // Resizable height for the params/headers/body area (null = auto height)
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Drag the bottom handle to grow/shrink the request details area
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = contentRef.current?.offsetHeight ?? 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(120, startHeight + (moveEvent.clientY - startY));
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

  // Keep dialog input in sync with request name
  useEffect(() => {
    setRequestName(request.name || "");
  }, [request.name]);

  const handleCloseSaveDialog = () => setShowSaveDialog(false);

  const handleConfirmSave = () => {
    const name = requestName.trim();
    if (!name) return;

    onUpdateRequest({ ...request, name });
    setShowSaveDialog(false);
    onSave();
  };

  // Parse a pasted cURL command, or treat the value as a URL and sync params.
  const handleUrlChange = (value: string) => {
    if (value.trim().toLowerCase().startsWith("curl")) {
      const parsed = parseCurl(value.trim());
      if (parsed) {
        onUpdateRequest({
          ...request,
          ...parsed,
          id: request.id,
          name: request.name || parsed.url || "Imported from cURL",
        });
        return;
      }
    }

    const params = parseUrlParams(value);
    onUpdateRequest(
      params.length > 0
        ? { ...request, url: value, params }
        : { ...request, url: value }
    );
  };

  return (
    <div className="space-y-4">
      {/* Request URL Section */}
      <div className="flex gap-2">
        <Select
          value={request.method}
          onValueChange={(method) => {
            const updatedRequest = { ...request, method };
            onUpdateRequest(updatedRequest);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getHttpMethodColor(
                    request.method
                  )}`}
                />
                {request.method}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(HTTP_METHODS).map(([method, color]) => (
              <SelectItem key={method} value={method}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  {method}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={request.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Enter request URL or paste cURL command"
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
              <Label htmlFor="request-name" className="text-right">
                Name
              </Label>
              <Input
                id="request-name"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                className="col-span-3"
                placeholder="Enter request name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmSave();
                  } else if (e.key === "Escape") {
                    handleCloseSaveDialog();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSaveDialog}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={!requestName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Tabs */}
      <div
        ref={contentRef}
        className="flex flex-col min-h-0"
        style={contentHeight ? { height: contentHeight } : undefined}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3 shrink-0">
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1 overflow-y-auto">
            <TabsContent value="params" className="mt-0">
          <KeyValueEditor
            items={request.params}
            onChange={(params) => {
              // Update the request with new params
              const updatedRequest = { ...request, params };
              
              // Use the buildUrlWithParams utility to update the URL with the new params
              const newUrl = buildUrlWithParams(request.url, params);
              updatedRequest.url = newUrl;
              
              onUpdateRequest(updatedRequest);
            }}
            placeholder={{
              key: "Parameter",
              value: "Value",
              description: "Description",
            }}
          />
        </TabsContent>

            <TabsContent value="headers" className="mt-0">
          <KeyValueEditor
            items={request.headers}
            onChange={(headers) => {
              const updatedRequest = { ...request, headers };
              onUpdateRequest(updatedRequest);
            }}
            placeholder={{
              key: "Header",
              value: "Value",
              description: "Description",
            }}
          />
        </TabsContent>

            <TabsContent value="body" className="mt-0 h-full">
          <RequestBodyViewer
            requestBody={request.body}
            onChange={(body) => {
              const updatedRequest = { ...request, body };
              onUpdateRequest(updatedRequest);
            }}
          />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Drag handle: pull down to expand the request details area */}
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
