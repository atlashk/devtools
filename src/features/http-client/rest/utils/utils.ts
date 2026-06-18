import {
  FormDataItem,
  KeyValuePair,
  RequestBody,
  RestRequest,
} from "../types/rest.types";
import { emptyKeyValue, makeId } from "../../shared/utils";

export { emptyKeyValue, makeId };

/** Create a blank form-data row. */
export const emptyFormDataItem = (): FormDataItem => ({
  ...emptyKeyValue("fd"),
  type: "text",
});

/** Replace a URL's query string with the given non-empty pairs (mutates `url`). */
export const applyParams = (
  url: URL,
  params: Array<{ key: string; value: string }>
): void => {
  url.search = "";
  params.forEach(({ key, value }) => {
    if (key && value) url.searchParams.append(key, value);
  });
};

/** Apply params to a base URL, returning the original string if it isn't a valid URL. */
export const buildUrlWithParams = (
  baseUrl: string,
  params: Array<{ key: string; value: string }>
): string => {
  try {
    const url = new URL(baseUrl);
    applyParams(url, params);
    return url.toString();
  } catch {
    return baseUrl;
  }
};

/** Parse the query string of a URL into editable rows (with a trailing blank row). */
export const parseUrlParams = (url: string): KeyValuePair[] => {
  try {
    const { searchParams } = new URL(url);
    if (!searchParams.toString()) return [];

    const params: KeyValuePair[] = [];
    for (const [key, value] of searchParams.entries()) {
      params.push({ id: makeId("param"), key, value, description: "" });
    }
    params.push(emptyKeyValue("param"));
    return params;
  } catch {
    return [];
  }
};

export const buildRequestBody = (
  requestBody: RequestBody
): FormData | string | null => {
  switch (requestBody?.type) {
    case "form-data": {
      if (!requestBody.formData?.length) return null;
      const formData = new FormData();
      requestBody.formData.forEach(({ key, value }) => {
        if (key && value) formData.append(key, value);
      });
      return formData;
    }
    case "x-www-form-urlencoded": {
      if (!requestBody.urlEncoded?.length) return null;
      const urlEncoded = new URLSearchParams();
      requestBody.urlEncoded.forEach(({ key, value }) => {
        if (key && value) urlEncoded.append(key, value);
      });
      return urlEncoded.toString();
    }
    case "raw":
      return requestBody.rawContent || null;
    default:
      return null;
  }
};

export const getContentType = (requestBody: RequestBody): string => {
  switch (requestBody?.type) {
    case "form-data":
      return "multipart/form-data";
    case "x-www-form-urlencoded":
      return "application/x-www-form-urlencoded";
    case "raw":
      return requestBody.rawContent?.startsWith("{")
        ? "application/json"
        : "text/plain";
    default:
      return "";
  }
};

const isJson = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

/** Split an `a=b&c=d` string into decoded key/value rows. */
const splitDataPairs = (data: string, prefix: string): KeyValuePair[] =>
  data.split("&").map((pair) => {
    const [key = "", value = ""] = pair.split("=");
    return {
      id: makeId(prefix),
      key: decodeURIComponent(key),
      value: decodeURIComponent(value),
      description: "",
    };
  });

const toUrlEncodedRows = (data: string): KeyValuePair[] => [
  ...splitDataPairs(data, "urlencoded"),
  emptyKeyValue("urlencoded"),
];

const toFormDataRows = (data: string): FormDataItem[] => [
  ...splitDataPairs(data, "formdata").map((row) => ({
    ...row,
    type: "text" as const,
  })),
  emptyFormDataItem(),
];

/**
 * Parse a bash-style `curl` command into a partial REST request.
 * Returns `null` if the input isn't a curl command or can't be parsed.
 */
export const parseCurl = (curlCommand: string): Partial<RestRequest> | null => {
  try {
    const normalized = curlCommand
      .trim()
      .replace(/\\\s*\n/g, " ") // unix line continuations
      .replace(/\s+/g, " ")
      .trim();

    if (!normalized.toLowerCase().startsWith("curl")) return null;

    const result: Partial<RestRequest> = {
      method: "GET",
      url: "",
      params: [],
      headers: [],
      body: { type: "none" },
    };

    // URL: quoted, after flags, or bare.
    const urlMatch =
      normalized.match(/curl\s+['"]([^'"\s]+)['"]/) ||
      normalized.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s]+)['"]?/) ||
      normalized.match(/curl\s+([^\s]+)/);
    if (urlMatch?.[1]) {
      result.url = urlMatch[1].replace(/^['"]|['"]$/g, "");
      result.params = parseUrlParams(result.url);
    }

    // Method: explicit -X wins, otherwise a body implies POST, else GET.
    const methodMatch = normalized.match(/-X\s+([A-Za-z]+)/);
    const hasData = /--data(?:-raw|-binary|-urlencode)?\s/.test(normalized);
    if (methodMatch) result.method = methodMatch[1].toUpperCase();
    else if (hasData) result.method = "POST";

    // Headers (+ -b cookies as a Cookie header), with a trailing blank row.
    const headers: KeyValuePair[] = [];
    for (const match of normalized.matchAll(/-H\s+['"]([^'"]+)['"]/g)) {
      const colon = match[1].indexOf(":");
      if (colon > 0) {
        headers.push({
          id: makeId("header"),
          key: match[1].slice(0, colon).trim(),
          value: match[1].slice(colon + 1).trim(),
          description: "",
        });
      }
    }
    const cookieMatch = normalized.match(/-b\s+['"]([^'"]+)['"]/);
    if (cookieMatch) {
      headers.push({
        id: makeId("header"),
        key: "Cookie",
        value: cookieMatch[1],
        description: "",
      });
    }
    headers.push(emptyKeyValue("header"));
    result.headers = headers;

    // Body: matches `$'...'`, quoted, or bare values for each data flag.
    const matchData = (flag: string) =>
      normalized.match(new RegExp(`${flag}\\s+\\$'([^']*)'`)) ||
      normalized.match(new RegExp(`${flag}\\s+['"]([^'"]*)['"]`)) ||
      normalized.match(new RegExp(`${flag}\\s+([^\\s]+)`));

    const rawMatch = matchData("--data-raw") || matchData("--data-binary");
    const dataMatch = matchData("--data");
    const urlencodeMatch = matchData("--data-urlencode");
    const formMatch = matchData("--form");

    if (rawMatch) {
      result.body = { type: "raw", rawContent: rawMatch[1] ?? "" };
    } else if (dataMatch) {
      const data = dataMatch[1];
      result.body = isJson(data)
        ? { type: "raw", rawContent: data }
        : { type: "x-www-form-urlencoded", urlEncoded: toUrlEncodedRows(data) };
    } else if (urlencodeMatch) {
      result.body = {
        type: "x-www-form-urlencoded",
        urlEncoded: toUrlEncodedRows(urlencodeMatch[1]),
      };
    } else if (formMatch) {
      result.body = { type: "form-data", formData: toFormDataRows(formMatch[1]) };
    }

    return result;
  } catch {
    return null;
  }
};
