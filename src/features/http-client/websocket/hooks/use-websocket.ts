"use client";

import { useEffect } from "react";
import {
  clearMessages,
  connect,
  createNewConnection,
  deleteConnection,
  deleteMultipleConnections,
  disconnect,
  loadConnections,
  saveConnection,
  sendMessage,
} from "../store/actions";
import { useWsStore } from "../store/store";
import { WsLiveState } from "../types/websocket.types";

const DISCONNECTED: WsLiveState = { status: "disconnected", messages: [] };

/**
 * Provides a single interface to the WebSocket store and its actions, scoped to
 * the currently active connection.
 */
export function useWebSocket() {
  const connections = useWsStore((state) => state.connections);
  const activeConnectionId = useWsStore((state) => state.activeConnectionId);
  const activeConnection = useWsStore((state) =>
    state.connections.find((conn) => conn.id === state.activeConnectionId)
  );
  const isLoadingInitial = useWsStore((state) => state.isLoadingInitial);
  const activeLive = useWsStore(
    (state) => state.live[state.activeConnectionId] ?? DISCONNECTED
  );
  const live = useWsStore((state) => state.live);

  const {
    updateConnection,
    renameConnection: renameInStore,
    setActiveConnection,
  } = useWsStore();

  useEffect(() => {
    loadConnections();
  }, []);

  // Update the name locally for instant feedback, then sync persisted connections.
  const renameConnection = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    renameInStore(id, newName);

    const connection = connections.find((conn) => conn.id === id);
    if (connection && !connection.isLocalOnly && !id.startsWith("tmp-")) {
      try {
        await saveConnection(id);
      } catch (error) {
        console.error("Failed to sync renamed connection:", error);
      }
    }
  };

  return {
    // State
    connections,
    activeConnectionId,
    activeConnection,
    activeLive,
    live,
    isLoadingInitial,

    // Tab actions
    setActiveConnectionId: setActiveConnection,
    addNewConnection: async () => {
      createNewConnection();
    },
    updateConnection,
    closeConnection: deleteConnection,
    closeMultipleConnections: deleteMultipleConnections,
    renameConnection,
    saveConnection,

    // Connection actions
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
}
