import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "https";

// Headers that browsers/Next manage and that would break the forwarded request.
const SKIPPED_HEADERS = new Set(["host", "origin", "referer", "user-agent"]);

// This proxy is a local dev tool for hitting arbitrary URLs (see README),
// so we don't want a corporate SSL-inspecting proxy/antivirus injecting an
// untrusted root CA to break every HTTPS request forwarded through here.
const insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });

// Node's default axios User-Agent gets sites to reject plain page fetches
// (e.g. for the HTML to Markdown tool) as bot traffic, so identify as a
// regular browser unless the caller sets its own.
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

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
    headers: { "User-Agent": DEFAULT_USER_AGENT, ...headers },
    data: data ?? undefined,
    responseType: "text",
    validateStatus: () => true, // handle all status codes manually
    httpsAgent: insecureHttpsAgent,
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
