import { getErrorMessage } from "@/hooks/use-error-handler";
import { makeId } from "../../shared/utils";
import wsConnectionsApi from "../api";
import { ACTIVE_WS_CONNECTION_ID_KEY } from "../constants";
import {
  WsConnection,
  WsMessage,
  WsMessageDirection,
} from "../types/websocket.types";
import { useWsStore } from "./store";

/**
 * Live WebSocket instances, keyed by connection id. Kept outside the zustand
 * store so the (non-serialisable) sockets never end up in React state.
 */
const sockets = new Map<string, WebSocket>();

const makeMessage = (
  direction: WsMessageDirection,
  data: string
): WsMessage => ({
  id: makeId("msg"),
  direction,
  data,
  timestamp: Date.now(),
});

// Load saved connections and restore the previously active one.
export const loadConnections = async (): Promise<void> => {
  const { setConnections, setIsLoadingInitial, setActiveConnection } =
    useWsStore.getState();

  setIsLoadingInitial(true);
  try {
    const saved = await wsConnectionsApi.getRequests();
    setConnections(saved);
    // Seed an empty live state for each saved connection.
    useWsStore.setState((state) => {
      const live = { ...state.live };
      saved.forEach((conn) => {
        if (!live[conn.id]) live[conn.id] = { status: "disconnected", messages: [] };
      });
      return { live };
    });

    if (saved.length === 0) {
      setActiveConnection("");
      return;
    }

    const savedActiveId = localStorage.getItem(ACTIVE_WS_CONNECTION_ID_KEY);
    const restored = saved.some((conn) => conn.id === savedActiveId);
    setActiveConnection(restored ? savedActiveId! : saved[0].id);
  } catch (error) {
    console.error("Failed to load connections:", getErrorMessage(error));
    setConnections([]);
    setActiveConnection("");
  } finally {
    setIsLoadingInitial(false);
  }
};

// Create a new local-only connection with a unique default name.
export const createNewConnection = (): string => {
  const { connections, addConnection } = useWsStore.getState();
  const baseName = "New Connection";

  const highest = Math.max(
    0,
    ...connections
      .filter((conn) => conn.name.startsWith(baseName))
      .map((conn) => Number(conn.name.match(/\((\d+)\)$/)?.[1] ?? 0))
  );

  const connection: WsConnection = {
    id: `tmp-${Date.now()}`,
    name: highest > 0 ? `${baseName} (${highest + 1})` : baseName,
    url: "",
    protocols: "",
    isLocalOnly: true,
  };

  addConnection(connection);
  return connection.id;
};

// Persist a connection, reconciling temporary ids with the storage-assigned id.
export const saveConnection = async (
  id: string
): Promise<string | undefined> => {
  const { connections, updateConnection, setActiveConnection } =
    useWsStore.getState();
  const connection = connections.find((conn) => conn.id === id);
  if (!connection) return;

  try {
    const saved = await wsConnectionsApi.saveRequest({
      ...connection,
      name: connection.name?.trim() || "Unnamed Connection",
    });
    if (!saved) return;

    const wasLocal = connection.isLocalOnly || connection.id.startsWith("tmp-");

    if (wasLocal && saved.id !== id) {
      updateConnection(id, {
        ...connection,
        id: saved.id,
        isLocalOnly: false,
        name: saved.name,
      });
      // Migrate live state and any open socket to the storage-assigned id.
      useWsStore.setState((state) => {
        const live = { ...state.live };
        if (live[id]) {
          live[saved.id] = live[id];
          delete live[id];
        }
        return { live };
      });
      const socket = sockets.get(id);
      if (socket) {
        sockets.set(saved.id, socket);
        sockets.delete(id);
      }
      setActiveConnection(saved.id);
      return saved.id;
    }

    updateConnection(id, { ...connection, isLocalOnly: false, name: saved.name });
    setActiveConnection(id);
    return id;
  } catch (error) {
    console.error("Failed to save connection:", getErrorMessage(error));
    throw error;
  }
};

// Delete a connection (closing its socket first).
export const deleteConnection = async (id: string): Promise<void> => {
  const { connections, removeConnection } = useWsStore.getState();
  const connection = connections.find((conn) => conn.id === id);

  closeSocket(id);
  if (connection && !connection.isLocalOnly) {
    await wsConnectionsApi.deleteRequest(id);
  }
  removeConnection(id);
};

// Delete multiple connections, closing sockets and only calling storage for persisted ones.
export const deleteMultipleConnections = (ids: string[]): void => {
  const { connections, removeMultipleConnections } = useWsStore.getState();

  ids.forEach((id) => {
    closeSocket(id);
    const connection = connections.find((conn) => conn.id === id);
    if (connection && !connection.isLocalOnly) wsConnectionsApi.deleteRequest(id);
  });

  removeMultipleConnections(ids);
};

/** Tear down any live socket for a connection without touching the store list. */
const closeSocket = (id: string): void => {
  const socket = sockets.get(id);
  if (socket) {
    try {
      socket.close();
    } catch {
      // ignore close errors
    }
    sockets.delete(id);
  }
};

/** Open a WebSocket connection and wire its events into the store. */
export const connect = (id: string): void => {
  const { connections, setStatus, addMessage } = useWsStore.getState();
  const connection = connections.find((conn) => conn.id === id);
  if (!connection) return;

  if (!connection.url.trim()) {
    addMessage(id, makeMessage("system", "Cannot connect: URL is empty"));
    return;
  }

  // Replace any existing socket for this connection.
  closeSocket(id);

  let socket: WebSocket;
  try {
    const protocols = connection.protocols
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    socket = protocols.length
      ? new WebSocket(connection.url, protocols)
      : new WebSocket(connection.url);
  } catch (error) {
    setStatus(id, "error");
    addMessage(
      id,
      makeMessage("system", `Failed to connect: ${getErrorMessage(error)}`)
    );
    return;
  }

  sockets.set(id, socket);
  setStatus(id, "connecting");
  addMessage(id, makeMessage("system", `Connecting to ${connection.url}...`));

  socket.onopen = () => {
    setStatus(id, "open");
    addMessage(id, makeMessage("system", "Connection established"));
  };

  socket.onmessage = (event: MessageEvent) => {
    const data =
      typeof event.data === "string" ? event.data : "[binary message]";
    addMessage(id, makeMessage("received", data));
  };

  socket.onerror = () => {
    addMessage(id, makeMessage("system", "Connection error"));
  };

  socket.onclose = (event: CloseEvent) => {
    setStatus(id, "closed");
    addMessage(
      id,
      makeMessage(
        "system",
        `Connection closed${event.code ? ` (code ${event.code})` : ""}${
          event.reason ? `: ${event.reason}` : ""
        }`
      )
    );
    sockets.delete(id);
  };
};

/** Gracefully close a connection's socket. */
export const disconnect = (id: string): void => {
  const socket = sockets.get(id);
  if (!socket) return;
  useWsStore.getState().setStatus(id, "closing");
  socket.close();
};

/** Send a text message over an open connection. */
export const sendMessage = (id: string, data: string): void => {
  const { addMessage } = useWsStore.getState();
  const socket = sockets.get(id);

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    addMessage(id, makeMessage("system", "Cannot send: not connected"));
    return;
  }

  socket.send(data);
  addMessage(id, makeMessage("sent", data));
};

/** Clear the message log for a connection. */
export const clearMessages = (id: string): void => {
  useWsStore.getState().clearMessages(id);
};
