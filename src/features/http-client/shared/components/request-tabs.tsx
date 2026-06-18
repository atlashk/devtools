"use client";

import { Button } from "@/components/ui/shadcn/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/shadcn/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/shadcn/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { BaseRequest } from "../types";

export interface RequestTabsProps<T extends BaseRequest> {
  requests: T[];
  activeRequestTab: string;
  onActiveTabChange: (requestId: string) => void;
  onAddRequest: () => Promise<void> | void;
  onCloseRequest: (requestId: string) => void;
  onCloseMultipleRequests?: (requestIds: string[]) => void;
  onRenameRequest?: (requestId: string, newName: string) => void;
  /** Optional tailwind background class for each tab's status dot. */
  colorFor?: (request: T) => string;
  /** Text shown when there are no tabs (defaults to "No requests"). */
  emptyLabel?: string;
  /** Label for the add button (defaults to "New Request"). */
  addLabel?: string;
}

/**
 * Generic request tab strip with close/rename/close-others context menu.
 * Shared by every HTTP Client protocol; the coloured dot is supplied via
 * `colorFor` so each protocol can map its own status (HTTP method, fixed
 * brand colour, connection state, ...).
 */
export function RequestTabs<T extends BaseRequest>({
  requests,
  activeRequestTab,
  onActiveTabChange,
  onAddRequest,
  onCloseRequest,
  onCloseMultipleRequests,
  onRenameRequest,
  colorFor,
  emptyLabel = "No requests",
  addLabel = "New Request",
}: RequestTabsProps<T>) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [requestsToClose, setRequestsToClose] = useState<string[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [requestToRename, setRequestToRename] = useState<{
    id: string;
    currentName: string;
  } | null>(null);
  const [newRequestName, setNewRequestName] = useState("");

  // Queue one or more tabs for closing and open the confirmation dialog.
  const queueClose = (ids: string[]) => {
    if (ids.length === 0) return;
    setRequestsToClose(ids);
    setShowConfirmDialog(true);
  };

  const handleCloseClick = (requestId: string) => queueClose([requestId]);

  const handleConfirmClose = () => {
    if (requestsToClose.length === 1) {
      onCloseRequest(requestsToClose[0]);
    } else if (requestsToClose.length > 1) {
      onCloseMultipleRequests?.(requestsToClose);
    }
    setRequestsToClose([]);
    setShowConfirmDialog(false);
  };

  const handleCancelClose = () => {
    setRequestsToClose([]);
    setShowConfirmDialog(false);
  };

  const handleCloseOtherTabs = (currentId: string) =>
    queueClose(requests.filter((req) => req.id !== currentId).map((req) => req.id));

  const handleCloseTabsToLeft = (currentId: string) => {
    const index = requests.findIndex((req) => req.id === currentId);
    queueClose(requests.slice(0, index).map((req) => req.id));
  };

  const handleCloseTabsToRight = (currentId: string) => {
    const index = requests.findIndex((req) => req.id === currentId);
    queueClose(requests.slice(index + 1).map((req) => req.id));
  };

  const handleCloseAllTabs = () => queueClose(requests.map((req) => req.id));

  const handleRenameClick = (requestId: string, currentName: string) => {
    if (requests.length > 0) {
      setRequestToRename({ id: requestId, currentName });
      setNewRequestName(currentName);
      setShowRenameDialog(true);
    }
  };

  const handleConfirmRename = async () => {
    if (
      requestToRename &&
      onRenameRequest &&
      newRequestName.trim() &&
      requests.length > 0
    ) {
      try {
        await onRenameRequest(requestToRename.id, newRequestName.trim());
      } catch (error) {
        console.error("Failed to rename request:", error);
      }
      setRequestToRename(null);
      setNewRequestName("");
    }
    setShowRenameDialog(false);
  };

  const handleCancelRename = () => {
    setRequestToRename(null);
    setNewRequestName("");
    setShowRenameDialog(false);
  };

  const isFirstTab = (currentId: string) =>
    requests.length > 0 && requests[0].id === currentId;

  const isLastTab = (currentId: string) =>
    requests.length > 0 && requests[requests.length - 1].id === currentId;

  return (
    <>
      <div className="border-b bg-background">
        <div className="flex items-center px-4 py-2">
          <ScrollArea className="flex-1">
            <div className="w-full relative h-10">
              {requests.length > 0 ? (
                <Tabs
                  value={activeRequestTab || ""}
                  onValueChange={(value) => {
                    if (requests.length > 0 || value === "") {
                      onActiveTabChange(value);
                    }
                  }}
                >
                  <TabsList className="flex absolute h-10">
                    {requests.map((request) => (
                      <ContextMenu key={request.id}>
                        <ContextMenuTrigger>
                          <TabsTrigger
                            value={request.id}
                            className="flex items-center gap-2"
                          >
                            {colorFor && (
                              <div
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${colorFor(
                                  request
                                )}`}
                              />
                            )}
                            <span>{request.name}</span>
                            <span
                              className="h-5 w-5 ml-1 flex items-center justify-center text-sm cursor-pointer hover:text-red-500 rounded opacity-60 hover:opacity-100 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseClick(request.id);
                              }}
                            >
                              ×
                            </span>
                          </TabsTrigger>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() =>
                              handleRenameClick(request.id, request.name)
                            }
                          >
                            Rename Tab
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => handleCloseClick(request.id)}
                          >
                            Close Tab
                          </ContextMenuItem>
                          {requests.length > 1 && (
                            <>
                              <ContextMenuItem
                                onClick={() => handleCloseOtherTabs(request.id)}
                              >
                                Close Other Tabs
                              </ContextMenuItem>
                              {!isFirstTab(request.id) && (
                                <ContextMenuItem
                                  onClick={() =>
                                    handleCloseTabsToLeft(request.id)
                                  }
                                >
                                  Close Tabs to Left
                                </ContextMenuItem>
                              )}
                              {!isLastTab(request.id) && (
                                <ContextMenuItem
                                  onClick={() =>
                                    handleCloseTabsToRight(request.id)
                                  }
                                >
                                  Close Tabs to Right
                                </ContextMenuItem>
                              )}
                              <ContextMenuItem onClick={handleCloseAllTabs}>
                                Close All Tabs
                              </ContextMenuItem>
                            </>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TabsList>
                </Tabs>
              ) : (
                <div className="flex items-center h-10 px-3 text-muted-foreground">
                  <span className="text-sm">{emptyLabel}</span>
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Add Button */}
          <Button onClick={onAddRequest} className="ml-2" title={addLabel}>
            <Plus className="w-4 h-4" />
            {addLabel}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Close {requestsToClose.length > 1 ? "Tabs" : "Tab"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to close{" "}
              {requestsToClose.length > 1
                ? `${requestsToClose.length} tabs`
                : "this tab"}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmClose}>
              Close {requestsToClose.length > 1 ? "Tabs" : "Tab"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Tab</DialogTitle>
            <DialogDescription>
              Enter a new name for this request tab.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newRequestName}
                onChange={(e) => setNewRequestName(e.target.value)}
                className="col-span-3"
                placeholder="Enter tab name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmRename();
                  } else if (e.key === "Escape") {
                    handleCancelRename();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRename}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRename}
              disabled={!newRequestName.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
