"use client";

import { ReactNode } from "react";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { BaseRequest } from "../types";
import { UseRequestResult } from "../hooks/create-use-request";
import { RequestTabs } from "./request-tabs";

interface RequestPanelRenderArgs<TRequest> {
  request: TRequest;
  onSend: () => void;
  onSave: () => void;
  onUpdateRequest: (updatedRequest: TRequest) => void;
  isLoading: boolean;
}

export interface RequestWorkbenchProps<TRequest extends BaseRequest, TResponse> {
  /** The protocol's request hook (built with createUseRequest). */
  useRequest: () => UseRequestResult<TRequest, TResponse>;
  /** Breadcrumb leaf label, e.g. "GraphQL". */
  breadcrumb: string;
  /** Renders the request editor for the active request. */
  renderRequestPanel: (args: RequestPanelRenderArgs<TRequest>) => ReactNode;
  /** Renders the response area for the active request. */
  renderResponsePanel: (response: TResponse | null) => ReactNode;
  /** Optional coloured dot per tab. */
  colorFor?: (request: TRequest) => string;
  /** Label for the request section header (defaults to "Request"). */
  requestLabel?: string;
  /** Label for the response section header (defaults to "Response"). */
  responseLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  createButtonLabel?: string;
  loadingText?: string;
}

/**
 * Shared page shell for request/response protocol clients (REST-style layout):
 * sidebar + breadcrumb header, a tab strip, and stacked request/response panels.
 * Protocols plug in their own request/response panels via render props.
 */
export function RequestWorkbench<TRequest extends BaseRequest, TResponse>({
  useRequest,
  breadcrumb,
  renderRequestPanel,
  renderResponsePanel,
  colorFor,
  requestLabel = "Request",
  responseLabel = "Response",
  emptyTitle = "No Requests",
  emptyDescription = "Get started by creating a new request",
  createButtonLabel = "Create Request",
  loadingText = "Loading requests...",
}: RequestWorkbenchProps<TRequest, TResponse>) {
  const {
    requests,
    activeRequestId,
    activeRequest,
    activeResponse,
    isActiveRequestLoading,
    isLoadingInitialRequests,
    setActiveRequestId,
    addNewRequest,
    updateRequest,
    closeRequest,
    closeMultipleRequests,
    renameRequest,
    sendRequest,
    saveRequest,
  } = useRequest();

  const { handleError } = useErrorHandler();

  const handleAddFirstRequest = async () => {
    if (requests.length === 0) {
      try {
        await addNewRequest();
      } catch (error) {
        handleError(error, "Failed to create new request");
      }
    }
  };

  const handleSaveRequest = async (id: string) => {
    try {
      await saveRequest(id);
      toast("Request saved successfully", {
        description: "Your request has been saved.",
      });
    } catch (error) {
      handleError(error, "Failed to save request");
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          {emptyTitle}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
        <div className="mt-6">
          <Button onClick={handleAddFirstRequest}>
            <Plus className="w-4 h-4 mr-2" />
            {createButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderRequestResponsePanels = () => (
    <>
      {/* Request Section */}
      <div className="border rounded-lg p-4 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-4">{requestLabel}</h3>
        {activeRequest ? (
          renderRequestPanel({
            request: activeRequest,
            onSend: () => sendRequest(activeRequest.id),
            onSave: () => handleSaveRequest(activeRequest.id),
            onUpdateRequest: (updatedRequest) =>
              updateRequest(activeRequest.id, {
                ...updatedRequest,
                name:
                  updatedRequest.name?.trim() ||
                  activeRequest.name ||
                  "Unnamed Request",
              }),
            isLoading: isActiveRequestLoading,
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No active request
          </div>
        )}
      </div>

      {/* Response Section */}
      <div
        className="border rounded-lg p-4 flex-1 min-h-0 flex flex-col"
        style={{ minHeight: "400px" }}
      >
        <h3 className="text-lg font-semibold mb-4 flex-shrink-0">
          {responseLabel}
        </h3>
        <div className="flex-grow flex flex-col overflow-hidden">
          {renderResponsePanel(activeResponse)}
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
                  <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          {requests.length > 0 && (
            <RequestTabs
              requests={requests}
              activeRequestTab={activeRequestId || ""}
              onActiveTabChange={setActiveRequestId}
              onAddRequest={addNewRequest}
              onCloseRequest={closeRequest}
              onCloseMultipleRequests={closeMultipleRequests}
              onRenameRequest={renameRequest}
              colorFor={colorFor}
            />
          )}

          <div className="flex flex-1 flex-col gap-4 p-4">
            {isLoadingInitialRequests ? (
              <LoadingProgress
                isLoading={isLoadingInitialRequests}
                loadingText={loadingText}
              />
            ) : requests.length === 0 ? (
              renderEmptyState()
            ) : (
              renderRequestResponsePanels()
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
