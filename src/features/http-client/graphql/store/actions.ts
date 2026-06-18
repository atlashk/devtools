import axios from "axios";
import { getErrorMessage } from "@/hooks/use-error-handler";
import { createRequestActions } from "../../shared/store/create-request-actions";
import {
  bodySizeKb,
  collectKeyValues,
  emptyKeyValue,
  errorResponse,
} from "../../shared/utils";
import graphqlRequestsApi from "../api";
import { ACTIVE_GRAPHQL_REQUEST_ID_KEY, DEFAULT_GRAPHQL_QUERY } from "../constants";
import { GraphQLRequest, GraphQLResponse } from "../types/graphql.types";
import { graphqlStore, useGraphqlStore } from "./store";

const actions = createRequestActions<GraphQLRequest, GraphQLResponse>({
  store: graphqlStore,
  api: graphqlRequestsApi,
  activeIdStorageKey: ACTIVE_GRAPHQL_REQUEST_ID_KEY,
  baseName: "New Request",
  buildRequest: (id, name) => ({
    id,
    name,
    url: "",
    headers: [emptyKeyValue("header")],
    query: DEFAULT_GRAPHQL_QUERY,
    variables: "{}",
    isLocalOnly: true,
  }),
});

export const {
  loadRequests,
  createNewRequest,
  saveRequest,
  deleteRequest,
  deleteMultipleRequests,
} = actions;

/**
 * Execute a GraphQL operation: POST `{ query, variables }` as JSON to the
 * endpoint through the shared `/api/proxy` and store the normalised response.
 */
export const sendRequest = async (requestId: string): Promise<void> => {
  const { requests, setLoading, setResponse } = useGraphqlStore.getState();
  const request = requests.find((req) => req.id === requestId);
  if (!request) return;

  setLoading(requestId, true);
  const startTime = Date.now();

  try {
    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      throw new Error(`Invalid URL: ${request.url}`);
    }

    // Variables are edited as raw text; treat blank as an empty object.
    let variables: unknown = {};
    const trimmedVariables = request.variables?.trim();
    if (trimmedVariables) {
      try {
        variables = JSON.parse(trimmedVariables);
      } catch {
        throw new Error("Variables must be valid JSON");
      }
    }

    const headers = collectKeyValues(request.headers);
    const hasContentType = Object.keys(headers).some(
      (key) => key.toLowerCase() === "content-type"
    );
    if (!hasContentType) headers["Content-Type"] = "application/json";

    const proxyResponse = await axios({
      url: "/api/proxy",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        url: url.toString(),
        method: "POST",
        headers,
        body: JSON.stringify({ query: request.query, variables }),
      }),
    });

    if (proxyResponse.status >= 400) {
      throw new Error(
        `Proxy error: ${proxyResponse.status} ${proxyResponse.statusText}`
      );
    }

    const data = proxyResponse.data;
    setResponse(requestId, {
      status: data.status,
      statusText: data.statusText,
      headers: data.headers,
      body: data.body,
      time: Date.now() - startTime,
      size: bodySizeKb(data.body),
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("GraphQL request error:", message);
    setResponse(requestId, errorResponse(message));
  } finally {
    setLoading(requestId, false);
  }
};
