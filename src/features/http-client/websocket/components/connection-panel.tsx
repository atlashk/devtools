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
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Plug, PlugZap, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { WsConnection, WsStatus } from "../types/websocket.types";

interface ConnectionPanelProps {
  connection: WsConnection;
  status: WsStatus;
  onUpdateConnection: (updated: WsConnection) => void;
  onSave: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendMessage: (data: string) => void;
}

export function ConnectionPanel({
  connection,
  status,
  onUpdateConnection,
  onSave,
  onConnect,
  onDisconnect,
  onSendMessage,
}: ConnectionPanelProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [connectionName, setConnectionName] = useState(connection.name || "");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setConnectionName(connection.name || "");
  }, [connection.name]);

  const isOpen = status === "open";
  const isConnecting = status === "connecting";

  const handleConfirmSave = () => {
    const name = connectionName.trim();
    if (!name) return;
    onUpdateConnection({ ...connection, name });
    setShowSaveDialog(false);
    onSave();
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage(draft);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      {/* URL + connect/save */}
      <div className="flex gap-2">
        <div className="flex w-20 items-center justify-center rounded-md border bg-violet-500/10 text-sm font-semibold text-violet-600">
          WS
        </div>
        <Input
          value={connection.url}
          onChange={(e) =>
            onUpdateConnection({ ...connection, url: e.target.value })
          }
          placeholder="Enter WebSocket URL (ws:// or wss://)"
          className="flex-1"
          disabled={isOpen || isConnecting}
        />
        {isOpen || isConnecting ? (
          <Button onClick={onDisconnect} variant="destructive" disabled={isConnecting}>
            <PlugZap className="w-4 h-4" />
            {isConnecting ? "Connecting..." : "Disconnect"}
          </Button>
        ) : (
          <Button onClick={onConnect} disabled={!connection.url.trim()}>
            <Plug className="w-4 h-4" />
            Connect
          </Button>
        )}
        <Button onClick={() => setShowSaveDialog(true)} variant="outline">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Sub-protocols */}
      <div className="flex items-center gap-2">
        <Label htmlFor="ws-protocols" className="text-xs whitespace-nowrap">
          Sub-protocols
        </Label>
        <Input
          id="ws-protocols"
          value={connection.protocols}
          onChange={(e) =>
            onUpdateConnection({ ...connection, protocols: e.target.value })
          }
          placeholder="Optional, comma-separated (e.g. graphql-ws, json)"
          className="flex-1 h-8"
          disabled={isOpen || isConnecting}
        />
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Connection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ws-connection-name" className="text-right">
                Name
              </Label>
              <Input
                id="ws-connection-name"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                className="col-span-3"
                placeholder="Enter connection name..."
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
            <Button onClick={handleConfirmSave} disabled={!connectionName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message composer */}
      <div className="space-y-2">
        <Label className="text-xs">Message</Label>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            isOpen
              ? "Type a message, then Send (Ctrl+Enter)"
              : "Connect to send messages"
          }
          className="font-mono text-sm min-h-[6rem]"
          disabled={!isOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={!isOpen || !draft.trim()}>
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
