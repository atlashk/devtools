import { BaseRequest, KeyValuePair, ProtocolResponse } from "../../shared/types";

export type { KeyValuePair };

/**
 * A saved gRPC call. Browsers cannot speak native gRPC (HTTP/2 framing), so
 * calls are issued using gRPC-JSON transcoding / the Connect protocol: a unary
 * `POST {baseUrl}/{service}/{method}` carrying the message as JSON.
 */
export interface GrpcRequest extends BaseRequest {
  /** Server base URL, e.g. `https://api.example.com`. */
  url: string;
  /** Fully-qualified service name, e.g. `package.v1.GreeterService`. */
  service: string;
  /** RPC method name, e.g. `SayHello`. */
  method: string;
  /** Call metadata, sent as request headers. */
  metadata: KeyValuePair[];
  /** Request message, edited as JSON text. */
  message: string;
}

/** gRPC-over-HTTP responses are plain HTTP/JSON, so we reuse the shared shape. */
export type GrpcResponse = ProtocolResponse;
