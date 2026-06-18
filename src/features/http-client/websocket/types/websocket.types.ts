import { BaseRequest } from "../../shared/types";

/** A saved WebSocket connection configuration. */
export interface WsConnection extends BaseRequest {
  /** WebSocket URL (ws:// or wss://). */
  url: string;
  /** Optional comma-separated sub-protocols (Sec-WebSocket-Protocol). */
  protocols: string;
}

/** Live connection lifecycle state. */
export type WsStatus =
  | "disconnected"
  | "connecting"
  | "open"
  | "closing"
  | "closed"
  | "error";

export type WsMessageDirection = "sent" | "received" | "system";

/** A single entry in a connection's message log. */
export interface WsMessage {
  id: string;
  direction: WsMessageDirection;
  data: string;
  timestamp: number;
}

/** Live (non-persisted) runtime state for one connection. */
export interface WsLiveState {
  status: WsStatus;
  messages: WsMessage[];
}
