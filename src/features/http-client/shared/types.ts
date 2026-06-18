/**
 * Shared types for the HTTP Client protocol modules (REST/GraphQL/gRPC/WebSocket).
 *
 * Each protocol defines its own request shape on top of {@link BaseRequest} and,
 * when it is request/response based, reuses {@link ProtocolResponse}.
 */

/** Minimal fields every protocol request shares (used by tabs and the stores). */
export interface BaseRequest {
  id: string;
  name: string;
  isLocalOnly?: boolean;
}

/** A generic editable key/value row used for headers, metadata, variables, etc. */
export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  description: string;
}

/**
 * A normalised response for request/response protocols (GraphQL, gRPC-over-HTTP).
 * Mirrors the REST response shape so the shared response panel can render any of them.
 */
export interface ProtocolResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}
