import { BaseRequest, KeyValuePair, ProtocolResponse } from "../../shared/types";

export type { KeyValuePair };

export interface FormDataItem extends KeyValuePair {
  type: "text" | "file";
  fileName?: string;
}

export type RequestBodyType =
  | "none"
  | "form-data"
  | "x-www-form-urlencoded"
  | "raw";

export interface RequestBody {
  type: RequestBodyType;
  formData?: FormDataItem[];
  urlEncoded?: KeyValuePair[];
  rawContent?: string;
}

export interface RestRequest extends BaseRequest {
  method: string;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody;
}

/** REST responses are plain HTTP/JSON, so we reuse the shared shape. */
export type RestResponse = ProtocolResponse;
