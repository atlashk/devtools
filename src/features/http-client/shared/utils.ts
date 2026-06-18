import { KeyValuePair, ProtocolResponse } from "./types";

let idCounter = 0;

/** Generate a process-unique id with a readable prefix. */
export const makeId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

/** Create a blank key/value row. */
export const emptyKeyValue = (prefix = "kv"): KeyValuePair => ({
  id: makeId(prefix),
  key: "",
  value: "",
  description: "",
});

/** Build a plain headers/metadata object from editable rows, dropping blanks. */
export const collectKeyValues = (rows: KeyValuePair[]): Record<string, string> => {
  const result: Record<string, string> = {};
  rows.forEach(({ key, value }) => {
    if (key && value) result[key] = value;
  });
  return result;
};

/** Compute the size of a response body in KB (rounded to 2 decimals). */
export const bodySizeKb = (body: string): number =>
  Math.round((new Blob([body]).size / 1024) * 100) / 100;

/** Build a normalised error response so failures render like any other response. */
export const errorResponse = (message: string): ProtocolResponse => ({
  status: 0,
  statusText: "Network Error",
  headers: {},
  body: message,
  time: 0,
  size: 0,
});
