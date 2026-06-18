"use client";

import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { ArrowDown, ArrowUp, Info, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { WsLiveState, WsMessage, WsStatus } from "../types/websocket.types";

const STATUS_LABELS: Record<WsStatus, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting",
  open: "Connected",
  closing: "Closing",
  closed: "Closed",
  error: "Error",
};

const STATUS_CLASSES: Record<WsStatus, string> = {
  disconnected: "text-gray-600",
  connecting: "text-yellow-600",
  open: "text-green-600",
  closing: "text-yellow-600",
  closed: "text-gray-600",
  error: "text-red-600",
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString(undefined, { hour12: false });

function MessageRow({ message }: { message: WsMessage }) {
  if (message.direction === "system") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
        <Info className="h-3 w-3 flex-shrink-0" />
        <span className="font-mono">{formatTime(message.timestamp)}</span>
        <span className="italic">{message.data}</span>
      </div>
    );
  }

  const isSent = message.direction === "sent";
  return (
    <div className="flex items-start gap-2 px-3 py-1.5 border-b last:border-b-0">
      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
        {isSent ? (
          <ArrowUp className="h-3 w-3 text-green-600" />
        ) : (
          <ArrowDown className="h-3 w-3 text-blue-600" />
        )}
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>
      <pre className="flex-1 whitespace-pre-wrap break-words text-xs font-mono">
        {message.data}
      </pre>
    </div>
  );
}

interface MessageLogProps {
  live: WsLiveState;
  onClear: () => void;
}

/** Scrollable, auto-following log of sent/received/system messages. */
export function MessageLog({ live, onClear }: MessageLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Follow the tail as new messages arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [live.messages.length]);

  return (
    <div className="flex flex-col h-full space-y-1">
      <div className="flex items-center justify-between gap-4 p-2 bg-muted/50 rounded-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Status:</span>
          <Badge variant="outline" className={STATUS_CLASSES[live.status]}>
            {STATUS_LABELS[live.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {live.messages.length} message
            {live.messages.length === 1 ? "" : "s"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={live.messages.length === 0}
          className="h-7"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto border rounded-lg min-h-0"
      >
        {live.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground py-8">
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          live.messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  );
}
