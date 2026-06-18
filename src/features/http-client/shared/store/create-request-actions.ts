import { getErrorMessage } from "@/hooks/use-error-handler";
import { RequestStorageApi } from "../api/create-storage-api";
import { BaseRequest } from "../types";
import { RequestStoreBundle } from "./create-request-store";

export interface CreateRequestActionsOptions<
  TRequest extends BaseRequest,
  TResponse
> {
  store: RequestStoreBundle<TRequest, TResponse>;
  api: RequestStorageApi<TRequest>;
  /** localStorage key holding the active request id (to restore on load). */
  activeIdStorageKey: string;
  /** Default tab name, e.g. "New Request" / "New Connection". */
  baseName: string;
  /** Build a fresh local-only request given a unique name and id. */
  buildRequest: (id: string, name: string) => TRequest;
}

/**
 * Build the lifecycle actions (load/create/save/delete) shared by the
 * request/response protocol modules. Protocol-specific behaviour — chiefly
 * `sendRequest` — lives in each module's own actions file.
 */
export function createRequestActions<TRequest extends BaseRequest, TResponse>({
  store,
  api,
  activeIdStorageKey,
  baseName,
  buildRequest,
}: CreateRequestActionsOptions<TRequest, TResponse>) {
  const { useStore } = store;

  // Load saved requests and restore the previously active one.
  const loadRequests = async (): Promise<void> => {
    const { setRequests, setIsLoadingInitialRequests, setActiveRequest } =
      useStore.getState();

    setIsLoadingInitialRequests(true);
    try {
      const saved = await api.getRequests();
      setRequests(saved);

      if (saved.length === 0) {
        setActiveRequest("");
        return;
      }

      const savedActiveId = localStorage.getItem(activeIdStorageKey);
      const restored = saved.some((req) => req.id === savedActiveId);
      setActiveRequest(restored ? savedActiveId! : saved[0].id);
    } catch (error) {
      console.error("Failed to load requests:", getErrorMessage(error));
      setRequests([]);
      setActiveRequest("");
    } finally {
      setIsLoadingInitialRequests(false);
    }
  };

  // Create a new local-only request with a unique default name.
  const createNewRequest = (): string => {
    const { requests, addRequest } = useStore.getState();

    const highest = Math.max(
      0,
      ...requests
        .filter((req) => req.name.startsWith(baseName))
        .map((req) => Number(req.name.match(/\((\d+)\)$/)?.[1] ?? 0))
    );

    const name = highest > 0 ? `${baseName} (${highest + 1})` : baseName;
    const request = buildRequest(`tmp-${Date.now()}`, name);

    addRequest(request);
    return request.id;
  };

  // Persist a request, reconciling temporary ids with the storage-assigned id.
  const saveRequest = async (id: string): Promise<string | undefined> => {
    const { requests, updateRequest, setActiveRequest, responses, setResponse } =
      useStore.getState();
    const request = requests.find((req) => req.id === id);

    if (!request) {
      console.error("Request not found with id:", id);
      return;
    }

    try {
      const saved = await api.saveRequest({
        ...request,
        name: request.name?.trim() || "Unnamed Request",
      });
      if (!saved) return;

      const wasLocal = request.isLocalOnly || request.id.startsWith("tmp-");

      // The storage layer assigned a new id: migrate the request and its response.
      if (wasLocal && saved.id !== id) {
        updateRequest(id, { ...request, id: saved.id, isLocalOnly: false, name: saved.name });
        if (responses[id]) setResponse(saved.id, responses[id]);
        setActiveRequest(saved.id);
        return saved.id;
      }

      updateRequest(id, { ...request, isLocalOnly: false, name: saved.name });
      setActiveRequest(id);
      return id;
    } catch (error) {
      console.error("Failed to save request:", getErrorMessage(error));
      throw error;
    }
  };

  // Delete a request, skipping the storage call for local-only requests.
  const deleteRequest = async (id: string): Promise<void> => {
    const { requests, removeRequest } = useStore.getState();
    const request = requests.find((req) => req.id === id);

    if (request && !request.isLocalOnly) {
      await api.deleteRequest(id);
    }
    removeRequest(id);
  };

  // Delete multiple requests, only calling storage for persisted ones.
  const deleteMultipleRequests = (ids: string[]): void => {
    const { requests, removeMultipleRequests } = useStore.getState();

    ids.forEach((id) => {
      const request = requests.find((req) => req.id === id);
      if (request && !request.isLocalOnly) api.deleteRequest(id);
    });

    removeMultipleRequests(ids);
  };

  return {
    loadRequests,
    createNewRequest,
    saveRequest,
    deleteRequest,
    deleteMultipleRequests,
  };
}
