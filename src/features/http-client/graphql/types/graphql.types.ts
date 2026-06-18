import { BaseRequest, KeyValuePair, ProtocolResponse } from "../../shared/types";

export type { KeyValuePair };

/** A saved GraphQL operation: endpoint, headers, query document and variables. */
export interface GraphQLRequest extends BaseRequest {
  /** GraphQL endpoint URL (queries are sent as HTTP POST). */
  url: string;
  headers: KeyValuePair[];
  /** The GraphQL document (query / mutation / subscription text). */
  query: string;
  /** JSON-encoded variables object, edited as raw text. */
  variables: string;
}

/** GraphQL responses are plain HTTP/JSON, so we reuse the shared shape. */
export type GraphQLResponse = ProtocolResponse;
