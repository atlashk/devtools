import { BaseRequest } from "../types";

/** CRUD surface every protocol store talks to (currently localStorage-backed). */
export interface RequestStorageApi<TRequest extends BaseRequest> {
  getRequests: () => Promise<TRequest[]>;
  getRequest: (id: string) => Promise<TRequest | null>;
  saveRequest: (request: TRequest) => Promise<TRequest | null>;
  deleteRequest: (id: string) => Promise<boolean>;
}

/**
 * Build a localStorage-backed {@link RequestStorageApi} for a given storage key
 * and id prefix. Each protocol persists its saved requests under its own key.
 *
 * @param storageKey - localStorage key holding the JSON array of requests.
 * @param idPrefix - prefix used for ids assigned on first save (e.g. "graphql").
 */
export function createStorageApi<TRequest extends BaseRequest>(
  storageKey: string,
  idPrefix: string
): RequestStorageApi<TRequest> {
  const read = (): TRequest[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as TRequest[]) : [];
    } catch {
      return [];
    }
  };

  const write = (requests: TRequest[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(requests));
  };

  return {
    getRequests: async () => read(),

    getRequest: async (id) => read().find((r) => r.id === id) ?? null,

    saveRequest: async (request) => {
      const requests = read();
      const isNew =
        !request.id || request.id.startsWith("tmp-") || request.isLocalOnly;
      const saved: TRequest = {
        ...request,
        id: isNew ? `${idPrefix}-${Date.now()}` : request.id,
        isLocalOnly: false,
      };
      write(
        isNew
          ? [...requests, saved]
          : requests.map((r) => (r.id === saved.id ? saved : r))
      );
      return saved;
    },

    deleteRequest: async (id) => {
      write(read().filter((r) => r.id !== id));
      return true;
    },
  };
}
