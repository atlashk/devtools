import axios from "axios";
import { getErrorMessage } from "@/hooks/use-error-handler";
import { createRequestActions } from "../../shared/store/create-request-actions";
import {
  bodySizeKb,
  collectKeyValues,
  emptyKeyValue,
  errorResponse,
} from "../../shared/utils";
import grpcRequestsApi from "../api";
import { ACTIVE_GRPC_REQUEST_ID_KEY } from "../constants";
import { GrpcRequest, GrpcResponse } from "../types/grpc.types";
import { grpcStore, useGrpcStore } from "./store";

const actions = createRequestActions<GrpcRequest, GrpcResponse>({
  store: grpcStore,
  api: grpcRequestsApi,
  activeIdStorageKey: ACTIVE_GRPC_REQUEST_ID_KEY,
  baseName: "New Request",
  buildRequest: (id, name) => ({
    id,
    name,
    url: "",
    service: "",
    method: "",
    metadata: [emptyKeyValue("metadata")],
    message: "{}",
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

/** Build the Connect/gRPC-JSON endpoint: `{baseUrl}/{service}/{method}`. */
const buildEndpoint = (request: GrpcRequest): string => {
  const base = request.url.trim().replace(/\/+$/, "");
  const service = request.service.trim().replace(/^\/+|\/+$/g, "");
  const method = request.method.trim().replace(/^\/+/, "");
  return `${base}/${service}/${method}`;
};

/**
 * Invoke a unary gRPC method via gRPC-JSON transcoding / the Connect protocol:
 * POST the request message as JSON to `{baseUrl}/{service}/{method}` through the
 * shared `/api/proxy`. Native streaming RPCs are not supported from the browser.
 */
export const sendRequest = async (requestId: string): Promise<void> => {
  const { requests, setLoading, setResponse } = useGrpcStore.getState();
  const request = requests.find((req) => req.id === requestId);
  if (!request) return;

  setLoading(requestId, true);
  const startTime = Date.now();

  try {
    if (!request.service.trim() || !request.method.trim()) {
      throw new Error("Service and method are required");
    }

    let endpoint: URL;
    try {
      endpoint = new URL(buildEndpoint(request));
    } catch {
      throw new Error(`Invalid server URL: ${request.url}`);
    }

    // The message is edited as JSON text; blank means an empty message.
    let message: unknown = {};
    const trimmedMessage = request.message?.trim();
    if (trimmedMessage) {
      try {
        message = JSON.parse(trimmedMessage);
      } catch {
        throw new Error("Message must be valid JSON");
      }
    }

    const headers = collectKeyValues(request.metadata);
    const hasContentType = Object.keys(headers).some(
      (key) => key.toLowerCase() === "content-type"
    );
    if (!hasContentType) headers["Content-Type"] = "application/json";

    const proxyResponse = await axios({
      url: "/api/proxy",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        url: endpoint.toString(),
        method: "POST",
        headers,
        body: JSON.stringify(message),
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
    console.error("gRPC request error:", message);
    setResponse(requestId, errorResponse(message));
  } finally {
    setLoading(requestId, false);
  }
};
