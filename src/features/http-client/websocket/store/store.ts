import { create } from "zustand";
import { ACTIVE_WS_CONNECTION_ID_KEY } from "../constants";
import {
  WsConnection,
  WsLiveState,
  WsMessage,
  WsStatus,
} from "../types/websocket.types";

const emptyLive = (): WsLiveState => ({
  status: "disconnected",
  messages: [],
});

interface WsState {
  connections: WsConnection[];
  activeConnectionId: string;
  isLoadingInitial: boolean;
  /** Live runtime state per connection id (status + message log). */
  live: Record<string, WsLiveState>;

  // Connection list / tab actions
  setConnections: (connections: WsConnection[]) => void;
  addConnection: (connection: WsConnection) => void;
  updateConnection: (id: string, connection: WsConnection) => void;
  removeConnection: (id: string) => void;
  removeMultipleConnections: (ids: string[]) => void;
  renameConnection: (id: string, newName: string) => void;
  setActiveConnection: (id: string) => void;
  setIsLoadingInitial: (isLoading: boolean) => void;

  // Live state actions
  setStatus: (id: string, status: WsStatus) => void;
  addMessage: (id: string, message: WsMessage) => void;
  clearMessages: (id: string) => void;
}

export const useWsStore = create<WsState>((set) => ({
  connections: [],
  activeConnectionId: "",
  isLoadingInitial: true,
  live: {},

  setConnections: (connections) => set({ connections }),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
      activeConnectionId: connection.id,
      live: { ...state.live, [connection.id]: emptyLive() },
    })),

  updateConnection: (id, updated) =>
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? updated : conn
      ),
    })),

  removeConnection: (id) =>
    set((state) => {
      const remaining = state.connections.filter((conn) => conn.id !== id);
      const live = { ...state.live };
      delete live[id];
      if (state.activeConnectionId !== id) return { connections: remaining, live };

      const index = state.connections.findIndex((conn) => conn.id === id);
      const next = state.connections[index + 1] || state.connections[index - 1];
      return { connections: remaining, live, activeConnectionId: next?.id ?? "" };
    }),

  removeMultipleConnections: (ids) =>
    set((state) => {
      const remaining = state.connections.filter(
        (conn) => !ids.includes(conn.id)
      );
      const live = { ...state.live };
      ids.forEach((id) => delete live[id]);
      if (!ids.includes(state.activeConnectionId)) {
        return { connections: remaining, live };
      }
      return {
        connections: remaining,
        live,
        activeConnectionId: remaining[0]?.id ?? "",
      };
    }),

  renameConnection: (id, newName) =>
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? { ...conn, name: newName.trim() } : conn
      ),
    })),

  setActiveConnection: (id) => set({ activeConnectionId: id }),

  setIsLoadingInitial: (isLoading) => set({ isLoadingInitial: isLoading }),

  setStatus: (id, status) =>
    set((state) => ({
      live: {
        ...state.live,
        [id]: { ...(state.live[id] ?? emptyLive()), status },
      },
    })),

  addMessage: (id, message) =>
    set((state) => {
      const current = state.live[id] ?? emptyLive();
      return {
        live: {
          ...state.live,
          [id]: { ...current, messages: [...current.messages, message] },
        },
      };
    }),

  clearMessages: (id) =>
    set((state) => ({
      live: {
        ...state.live,
        [id]: { ...(state.live[id] ?? emptyLive()), messages: [] },
      },
    })),
}));

// Persist the active connection id to localStorage whenever it changes.
if (typeof window !== "undefined") {
  useWsStore.subscribe((state, prev) => {
    if (state.activeConnectionId === prev.activeConnectionId) return;
    if (state.activeConnectionId) {
      localStorage.setItem(ACTIVE_WS_CONNECTION_ID_KEY, state.activeConnectionId);
    } else {
      localStorage.removeItem(ACTIVE_WS_CONNECTION_ID_KEY);
    }
  });
}
