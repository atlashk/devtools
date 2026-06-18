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
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";

import { Button } from "@/components/ui/shadcn/button";
import { LoadingProgress } from "@/components/ui/shadcn/loading-progress";
import { RequestPanel } from "@/features/http-client/rest/components/request-panel";
import { RequestTabs } from "@/features/http-client/shared/components/request-tabs";
import { ResponsePanel } from "@/features/http-client/shared/components/response-panel";
import { Plus } from "lucide-react";
import { getHttpMethodColor } from "@/utils/utils";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { toast } from "sonner";
import { useRestRequest } from "./hooks/use-rest-request";

/**
 * RestClientPage Component
 *
 * Main component for the HTTP REST client interface that allows users to create,
 * manage, and send HTTP requests, as well as view responses.
 *
 * The component uses the useRestRequest hook to manage the state of requests
 * and responses, and provides UI for creating, editing, and sending requests.
 */
export default function RestClientPage() {
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
  } = useRestRequest();

  const { handleError } = useErrorHandler();

  /**
   * Creates a new request when the user clicks the add button in empty state
   *
   * This function is triggered from the empty state UI and ensures we only
   * create a new request when there are no existing requests. It also handles
   * error cases with appropriate user feedback.
   */
  const handleAddFirstRequest = async () => {
    if (requests.length === 0) {
      try {
        await addNewRequest();
      } catch (error) {
        handleError(error, "Failed to create new request");
      }
    }
  };

  /**
   * Saves a request with toast notifications for success/failure
   *
   * This function handles the request saving process and provides appropriate
   * feedback to the user through toast notifications for both success and failure cases.
   *
   * @param id - The ID of the request to save
   */
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

  /**
   * Renders the loading state with progress indicator
   *
   * Displays a centered progress bar and loading message while requests are being loaded
   * @returns React component for the loading state
   */
  const renderLoadingState = () => (
    <LoadingProgress isLoading={isLoadingInitialRequests} loadingText="Loading requests..." />
  );

  /**
   * Renders the empty state when no requests exist
   *
   * Displays a header with title and add button, followed by a centered message
   * encouraging the user to create their first request
   * @returns React component for the empty state
   */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new request
        </p>
        <div className="mt-6">
          <Button onClick={handleAddFirstRequest}>
            <Plus className="w-4 h-4 mr-2" />
            Create Request
          </Button>
        </div>
      </div>
    </div>
  );

  /**
   * Renders the request and response panels when requests exist
   *
   * Displays a two-panel layout with the request editor on top and response viewer below.
   * The request panel shows the active request's details and controls for sending/saving.
   * The response panel shows the response for the active request tab.
   *
   * @returns React component for the request/response interface
   */
  const renderRequestResponsePanels = () => (
    <>
      {/* Request Section */}
      <div className="border rounded-lg p-4 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-4">Request</h3>
        {activeRequest ? (
          <RequestPanel
            request={activeRequest}
            onSend={() => {
              sendRequest(activeRequest.id);
            }}
            onSave={() => {
              handleSaveRequest(activeRequest.id);
            }}
            onUpdateRequest={(updatedRequest) =>
              updateRequest(activeRequest.id, {
                ...updatedRequest,
                name:
                  updatedRequest.name?.trim() ||
                  activeRequest.name ||
                  "Unnamed Request",
              })
            }
            isLoading={isActiveRequestLoading}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No active request
          </div>
        )}
      </div>

      {/* Response Section */}
      <div className="border rounded-lg p-4 flex-1 min-h-0 flex flex-col" style={{ minHeight: '400px' }}>
        <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Response</h3>
        <div className="flex-grow flex flex-col overflow-hidden">
          <ResponsePanel response={activeResponse || null} />
        </div>
      </div>
    </>
  );

  /**
   * Renders the page header with breadcrumbs navigation
   * @returns React component for the header
   */
  const renderHeader = () => (
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
              <BreadcrumbPage>REST</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {renderHeader()}

        <div className="flex flex-1 flex-col gap-4">
          {/* Request Tabs - Only show when there are requests */}
          {requests.length > 0 && (
            <RequestTabs
              requests={requests}
              activeRequestTab={activeRequestId || ""}
              onActiveTabChange={setActiveRequestId}
              onAddRequest={addNewRequest}
              onCloseRequest={closeRequest}
              onCloseMultipleRequests={closeMultipleRequests}
              onRenameRequest={renameRequest}
              colorFor={(req) => getHttpMethodColor(req.method)}
            />
          )}

          {/* Main Content */}
          <div className="flex flex-1 flex-col gap-4 p-4">
            {isLoadingInitialRequests
              ? renderLoadingState()
              : requests.length === 0
              ? renderEmptyState()
              : renderRequestResponsePanels()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
