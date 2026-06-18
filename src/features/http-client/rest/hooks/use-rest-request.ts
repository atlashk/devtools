"use client";

import { createUseRequest } from "../../shared/hooks/create-use-request";
import { restStore } from "../store/store";
import {
  createNewRequest,
  deleteMultipleRequests,
  deleteRequest,
  loadRequests,
  saveRequest,
  sendRequest,
} from "../store/actions";

/** Hook exposing the REST request store + actions, scoped to the active tab. */
export const useRestRequest = createUseRequest({
  store: restStore,
  actions: {
    loadRequests,
    createNewRequest,
    saveRequest,
    deleteRequest,
    deleteMultipleRequests,
  },
  sendRequest,
});
