import { create, UseBoundStore, StoreApi } from "zustand";
import { BaseRequest } from "../types";

/**
 * Generic store state shared by the request/response protocol modules.
 * `TRequest` is the protocol's request shape, `TResponse` its response shape.
 */
export interface RequestStoreState<TRequest extends BaseRequest, TResponse> {
  requests: TRequest[];
  responses: Record<string, TResponse | null>;
  loadingRequests: Set<string>;
  activeRequestId: string;
  isLoadingInitialRequests: boolean;

  // Actions
  setRequests: (requests: TRequest[]) => void;
  addRequest: (request: TRequest) => void;
  updateRequest: (id: string, request: TRequest) => void;
  removeRequest: (id: string) => void;
  removeMultipleRequests: (ids: string[]) => void;
  renameRequest: (id: string, newName: string) => void;
  setResponse: (id: string, response: TResponse | null) => void;
  setActiveRequest: (id: string) => void;
  setLoading: (id: string, isLoading: boolean) => void;
  setIsLoadingInitialRequests: (isLoading: boolean) => void;
}

/** Convenience hooks derived from a request store, scoped to a request id. */
export interface RequestSelectors<TRequest extends BaseRequest, TResponse> {
  useActiveRequest: () => TRequest | undefined;
  useRequestResponse: (id: string) => TResponse | null;
  useIsRequestLoading: (id: string) => boolean;
  useAllRequests: () => TRequest[];
  useActiveRequestId: () => string;
  useIsLoadingInitialRequests: () => boolean;
}

export interface RequestStoreBundle<TRequest extends BaseRequest, TResponse> {
  useStore: UseBoundStore<StoreApi<RequestStoreState<TRequest, TResponse>>>;
  selectors: RequestSelectors<TRequest, TResponse>;
}

/**
 * Create a zustand store (plus selector hooks) implementing the request/response
 * tab model: a list of requests, per-request responses and loading flags, and a
 * persisted active request id.
 *
 * @param activeIdStorageKey - localStorage key used to restore the active tab.
 */
export function createRequestStore<TRequest extends BaseRequest, TResponse>(
  activeIdStorageKey: string
): RequestStoreBundle<TRequest, TResponse> {
  const useStore = create<RequestStoreState<TRequest, TResponse>>((set) => ({
    requests: [],
    responses: {},
    loadingRequests: new Set<string>(),
    activeRequestId: "",
    isLoadingInitialRequests: true,

    setRequests: (requests) => set({ requests }),

    addRequest: (request) =>
      set((state) => ({
        requests: [...state.requests, request],
        activeRequestId: request.id,
      })),

    updateRequest: (id, updatedRequest) =>
      set((state) => ({
        requests: state.requests.map((req) =>
          req.id === id ? updatedRequest : req
        ),
      })),

    removeRequest: (id) =>
      set((state) => {
        const remaining = state.requests.filter((req) => req.id !== id);
        if (state.activeRequestId !== id) return { requests: remaining };

        // Activate the neighbouring tab when the active one is removed.
        const index = state.requests.findIndex((req) => req.id === id);
        const next = state.requests[index + 1] || state.requests[index - 1];
        return { requests: remaining, activeRequestId: next?.id ?? "" };
      }),

    removeMultipleRequests: (ids) =>
      set((state) => {
        const remaining = state.requests.filter((req) => !ids.includes(req.id));
        if (!ids.includes(state.activeRequestId)) return { requests: remaining };
        return { requests: remaining, activeRequestId: remaining[0]?.id ?? "" };
      }),

    renameRequest: (id, newName) =>
      set((state) => ({
        requests: state.requests.map((req) =>
          req.id === id ? { ...req, name: newName.trim() } : req
        ),
      })),

    setResponse: (id, response) =>
      set((state) => ({
        responses: { ...state.responses, [id]: response },
      })),

    setActiveRequest: (id) => set({ activeRequestId: id }),

    setLoading: (id, isLoading) =>
      set((state) => {
        const loadingRequests = new Set(state.loadingRequests);
        if (isLoading) loadingRequests.add(id);
        else loadingRequests.delete(id);
        return { loadingRequests };
      }),

    setIsLoadingInitialRequests: (isLoading) =>
      set({ isLoadingInitialRequests: isLoading }),
  }));

  // Persist the active request id to localStorage whenever it changes.
  if (typeof window !== "undefined") {
    useStore.subscribe((state, prev) => {
      if (state.activeRequestId === prev.activeRequestId) return;
      if (state.activeRequestId) {
        localStorage.setItem(activeIdStorageKey, state.activeRequestId);
      } else {
        localStorage.removeItem(activeIdStorageKey);
      }
    });
  }

  const selectors: RequestSelectors<TRequest, TResponse> = {
    useActiveRequest: () =>
      useStore((state) =>
        state.requests.find((req) => req.id === state.activeRequestId)
      ),
    useRequestResponse: (id) => useStore((state) => state.responses[id] || null),
    useIsRequestLoading: (id) =>
      useStore((state) => state.loadingRequests.has(id)),
    useAllRequests: () => useStore((state) => state.requests),
    useActiveRequestId: () => useStore((state) => state.activeRequestId),
    useIsLoadingInitialRequests: () =>
      useStore((state) => state.isLoadingInitialRequests),
  };

  return { useStore, selectors };
}
