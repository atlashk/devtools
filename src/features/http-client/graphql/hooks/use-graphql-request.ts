"use client";

import { createUseRequest } from "../../shared/hooks/create-use-request";
import { graphqlStore } from "../store/store";
import {
  createNewRequest,
  deleteMultipleRequests,
  deleteRequest,
  loadRequests,
  saveRequest,
  sendRequest,
} from "../store/actions";

/** Hook exposing the GraphQL request store + actions, scoped to the active tab. */
export const useGraphqlRequest = createUseRequest({
  store: graphqlStore,
  actions: {
    loadRequests,
    createNewRequest,
    saveRequest,
    deleteRequest,
    deleteMultipleRequests,
  },
  sendRequest,
});
