import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Headers that browsers/Next manage and that would break the forwarded request.
const SKIPPED_HEADERS = new Set(["host", "origin", "referer", "user-agent"]);

const ensureProtocol = (url: string): string =>
  /^https?:\/\//i.test(url) ? url : `http://${url}`;

const sanitizeHeaders = (
  headers: Record<string, unknown> = {}
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!SKIPPED_HEADERS.has(key.toLowerCase())) result[key] = String(value);
  }
  return result;
};

// Forward a request to the target and serialize its response.
const forward = async (
  targetUrl: string,
  method: string,
  headers: Record<string, string>,
  data?: unknown
) => {
  const response = await axios({
    url: ensureProtocol(targetUrl),
    method: method || "GET",
    headers,
    data: data ?? undefined,
    responseType: "text",
    validateStatus: () => true, // handle all status codes manually
  });

  const responseHeaders: Record<string, string> = {};
  Object.entries(response.headers).forEach(([key, value]) => {
    responseHeaders[key] = String(value);
  });

  return NextResponse.json({
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body: response.data,
    url: response.config.url,
  });
};

const failure = (error: unknown) =>
  NextResponse.json(
    {
      error: "Failed to make request",
      details: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 }
  );

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let url: string;
    let method: string;
    let headers: Record<string, string>;
    let body: unknown;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      url = formData.get("url") as string;
      method = formData.get("method") as string;
      const headersStr = formData.get("headers") as string;
      headers = sanitizeHeaders(headersStr ? JSON.parse(headersStr) : {});

      const entries: Record<string, FormDataEntryValue> = {};
      for (const [key, value] of formData.entries()) {
        if (!["url", "method", "headers"].includes(key)) entries[key] = value;
      }
      body = entries;
    } else {
      const json = await request.json();
      url = json.url;
      method = json.method;
      headers = sanitizeHeaders(json.headers);
      body = json.body;

      // Parse stringified JSON bodies so axios sends them as JSON.
      if (
        typeof body === "string" &&
        headers["Content-Type"] === "application/json"
      ) {
        try {
          body = JSON.parse(body);
        } catch {
          return NextResponse.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
      }
    }

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    return await forward(url, method, headers, body);
  } catch (error) {
    return failure(error);
  }
}

// Simple GET passthrough for quick testing: /api/proxy?url=...
export async function GET(request: NextRequest) {
  const urlParam = new URL(request.url).searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    return await forward(urlParam, "GET", {});
  } catch (error) {
    return failure(error);
  }
}
