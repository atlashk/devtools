"use client";

import { createUseRequest } from "../../shared/hooks/create-use-request";
import { grpcStore } from "../store/store";
import {
  createNewRequest,
  deleteMultipleRequests,
  deleteRequest,
  loadRequests,
  saveRequest,
  sendRequest,
} from "../store/actions";

/** Hook exposing the gRPC request store + actions, scoped to the active tab. */
export const useGrpcRequest = createUseRequest({
  store: grpcStore,
  actions: {
    loadRequests,
    createNewRequest,
    saveRequest,
    deleteRequest,
    deleteMultipleRequests,
  },
  sendRequest,
});
