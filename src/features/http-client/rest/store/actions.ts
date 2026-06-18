import axios from "axios";
import { getErrorMessage } from "@/hooks/use-error-handler";
import { createRequestActions } from "../../shared/store/create-request-actions";
import { bodySizeKb, errorResponse } from "../../shared/utils";
import restRequestsApi from "../api";
import { ACTIVE_REST_REQUEST_ID_KEY } from "../constants";
import { RestRequest, RestResponse } from "../types/rest.types";
import {
  applyParams,
  buildRequestBody,
  emptyKeyValue,
  getContentType,
} from "../utils/utils";
import { restStore, useRestStore } from "./store";

const WRITE_METHODS = ["POST", "PUT", "PATCH"];

const actions = createRequestActions<RestRequest, RestResponse>({
  store: restStore,
  api: restRequestsApi,
  activeIdStorageKey: ACTIVE_REST_REQUEST_ID_KEY,
  baseName: "New Request",
  buildRequest: (id, name) => ({
    id,
    name,
    method: "GET",
    url: "",
    params: [emptyKeyValue("param")],
    headers: [emptyKeyValue("header")],
    body: { type: "none" },
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

// Send a request through the proxy and store the response.
export const sendRequest = async (requestId: string): Promise<void> => {
  const { requests, setLoading, setResponse } = useRestStore.getState();
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
    applyParams(url, request.params);

    const headers: Record<string, string> = {};
    request.headers.forEach(({ key, value }) => {
      if (key && value) headers[key] = value;
    });

    let requestBody: string | FormData | null = null;
    if (WRITE_METHODS.includes(request.method) && request.body) {
      requestBody = buildRequestBody(request.body);

      const hasContentType =
        "Content-Type" in headers || "content-type" in headers;
      if (!hasContentType) {
        // Raw bodies default to JSON; others use their natural content type.
        const contentType =
          request.body.type === "raw" && request.body.rawContent
            ? "application/json"
            : getContentType(request.body);
        if (contentType) headers["Content-Type"] = contentType;
      }
    }

    let proxyBody: string | FormData;
    let proxyHeaders: Record<string, string> = {};

    if (requestBody instanceof FormData) {
      requestBody.append("url", url.toString());
      requestBody.append("method", request.method);
      requestBody.append("headers", JSON.stringify(headers));
      proxyBody = requestBody;
    } else {
      proxyBody = JSON.stringify({
        url: url.toString(),
        method: request.method,
        headers,
        body: requestBody,
      });
      proxyHeaders = { "Content-Type": "application/json" };
    }

    const proxyResponse = await axios({
      url: "/api/proxy",
      method: "POST",
      headers: proxyHeaders,
      data: proxyBody,
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
    console.error("Request error:", message);
    setResponse(requestId, errorResponse(message));
  } finally {
    setLoading(requestId, false);
  }
};
