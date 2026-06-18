"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { LoadingProgress } from "@/components/ui/shadcn/loading-progress";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RequestTabs } from "../shared/components/request-tabs";
import { ConnectionPanel } from "./components/connection-panel";
import { MessageLog } from "./components/message-log";
import { useWebSocket } from "./hooks/use-websocket";
import { WsConnection, WsStatus } from "./types/websocket.types";

/** Tab dot colour reflecting the live connection status. */
const statusDot = (status: WsStatus | undefined): string => {
  switch (status) {
    case "open":
      return "bg-green-500";
    case "connecting":
    case "closing":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

/**
 * WebSocket client page: open native WebSocket connections directly from the
 * browser, send messages and watch the live message log. Reuses the shared tab
 * strip but has its own connection/log layout (no request/response cycle).
 */
export default function WebSocketClientPage() {
  const {
    connections,
    activeConnectionId,
    activeConnection,
    activeLive,
    live,
    isLoadingInitial,
    setActiveConnectionId,
    addNewConnection,
    updateConnection,
    closeConnection,
    closeMultipleConnections,
    renameConnection,
    saveConnection,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useWebSocket();

  const { handleError } = useErrorHandler();

  const handleAddFirstConnection = async () => {
    if (connections.length === 0) {
      try {
        await addNewConnection();
      } catch (error) {
        handleError(error, "Failed to create new connection");
      }
    }
  };

  const handleSaveConnection = async (id: string) => {
    try {
      await saveConnection(id);
      toast("Connection saved successfully", {
        description: "Your connection has been saved.",
      });
    } catch (error) {
      handleError(error, "Failed to save connection");
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No Connections
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new connection
        </p>
        <div className="mt-6">
          <Button onClick={handleAddFirstConnection}>
            <Plus className="w-4 h-4 mr-2" />
            Create Connection
          </Button>
        </div>
      </div>
    </div>
  );

  const renderConnectionPanels = () => (
    <>
      {/* Connection Section */}
      <div className="border rounded-lg p-4 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-4">Connection</h3>
        {activeConnection ? (
          <ConnectionPanel
            connection={activeConnection}
            status={activeLive.status}
            onUpdateConnection={(updated) =>
              updateConnection(activeConnection.id, {
                ...updated,
                name:
                  updated.name?.trim() ||
                  activeConnection.name ||
                  "Unnamed Connection",
              })
            }
            onSave={() => handleSaveConnection(activeConnection.id)}
            onConnect={() => connect(activeConnection.id)}
            onDisconnect={() => disconnect(activeConnection.id)}
            onSendMessage={(data) => sendMessage(activeConnection.id, data)}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No active connection
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div
        className="border rounded-lg p-4 flex-1 min-h-0 flex flex-col"
        style={{ minHeight: "400px" }}
      >
        <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Messages</h3>
        <div className="flex-grow flex flex-col overflow-hidden">
          <MessageLog
            live={activeLive}
            onClear={() => activeConnection && clearMessages(activeConnection.id)}
          />
        </div>
      </div>
    </>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">HTTP Client</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>WebSocket</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          {connections.length > 0 && (
            <RequestTabs<WsConnection>
              requests={connections}
              activeRequestTab={activeConnectionId || ""}
              onActiveTabChange={setActiveConnectionId}
              onAddRequest={addNewConnection}
              onCloseRequest={closeConnection}
              onCloseMultipleRequests={closeMultipleConnections}
              onRenameRequest={renameConnection}
              colorFor={(conn) => statusDot(live[conn.id]?.status)}
              emptyLabel="No connections"
              addLabel="New Connection"
            />
          )}

          <div className="flex flex-1 flex-col gap-4 p-4">
            {isLoadingInitial ? (
              <LoadingProgress
                isLoading={isLoadingInitial}
                loadingText="Loading connections..."
              />
            ) : connections.length === 0 ? (
              renderEmptyState()
            ) : (
              renderConnectionPanels()
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
