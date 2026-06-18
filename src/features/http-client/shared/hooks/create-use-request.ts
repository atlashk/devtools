"use client";

import { useEffect } from "react";
import { BaseRequest } from "../types";
import { RequestStoreBundle } from "../store/create-request-store";

interface RequestActions {
  loadRequests: () => Promise<void>;
  createNewRequest: () => string;
  saveRequest: (id: string) => Promise<string | undefined>;
  deleteRequest: (id: string) => Promise<void>;
  deleteMultipleRequests: (ids: string[]) => void;
}

export interface CreateUseRequestOptions<
  TRequest extends BaseRequest,
  TResponse
> {
  store: RequestStoreBundle<TRequest, TResponse>;
  actions: RequestActions;
  /** Protocol-specific send implementation. */
  sendRequest: (id: string) => Promise<void>;
}

/** Everything a protocol page needs from its store, scoped to the active tab. */
export interface UseRequestResult<TRequest extends BaseRequest, TResponse> {
  requests: TRequest[];
  activeRequestId: string;
  activeRequest: TRequest | undefined;
  activeResponse: TResponse | null;
  isActiveRequestLoading: boolean;
  isLoadingInitialRequests: boolean;
  setActiveRequestId: (id: string) => void;
  addNewRequest: () => Promise<void>;
  updateRequest: (id: string, request: TRequest) => void;
  closeRequest: (id: string) => Promise<void>;
  closeMultipleRequests: (ids: string[]) => void;
  renameRequest: (id: string, newName: string) => Promise<void>;
  sendRequest: (id: string) => Promise<void>;
  saveRequest: (id: string) => Promise<string | undefined>;
}

/**
 * Build the React hook a protocol page uses to talk to its store and actions,
 * scoped to the currently active request. Mirrors the original `useRestRequest`.
 */
export function createUseRequest<TRequest extends BaseRequest, TResponse>({
  store,
  actions,
  sendRequest,
}: CreateUseRequestOptions<TRequest, TResponse>) {
  const { useStore, selectors } = store;

  return function useRequest(): UseRequestResult<TRequest, TResponse> {
    const requests = selectors.useAllRequests();
    const activeRequestId = selectors.useActiveRequestId();
    const activeRequest = selectors.useActiveRequest();
    const isLoadingInitialRequests = selectors.useIsLoadingInitialRequests();
    const activeResponse = selectors.useRequestResponse(activeRequestId);
    const isActiveRequestLoading = selectors.useIsRequestLoading(activeRequestId);

    const {
      updateRequest,
      renameRequest: renameInStore,
      setActiveRequest,
    } = useStore();

    useEffect(() => {
      actions.loadRequests();
    }, []);

    // Update the name locally for instant feedback, then sync persisted requests.
    const renameRequest = async (id: string, newName: string) => {
      if (!newName.trim()) return;
      renameInStore(id, newName);

      const request = requests.find((req) => req.id === id);
      if (request && !request.isLocalOnly && !id.startsWith("tmp-")) {
        try {
          await actions.saveRequest(id);
        } catch (error) {
          console.error("Failed to sync renamed request:", error);
        }
      }
    };

    return {
      // State
      requests,
      activeRequestId,
      activeRequest,
      activeResponse,
      isActiveRequestLoading,
      isLoadingInitialRequests,

      // Actions
      setActiveRequestId: setActiveRequest,
      addNewRequest: async () => {
        actions.createNewRequest();
      },
      updateRequest,
      closeRequest: actions.deleteRequest,
      closeMultipleRequests: actions.deleteMultipleRequests,
      renameRequest,
      sendRequest,
      saveRequest: actions.saveRequest,
    };
  };
}
