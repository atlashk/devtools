"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Check, Copy, KeyRound, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

function base64UrlDecode(input: string): string {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return decodeURIComponent(escape(atob(str)));
}

function base64UrlToBytes(input: string): Uint8Array {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("A JWT must have 3 parts separated by dots");
  }
  const [headerPart, payloadPart, signature] = parts;
  const header = JSON.parse(base64UrlDecode(headerPart));
  const payload = JSON.parse(base64UrlDecode(payloadPart));
  return { header, payload, signature };
}

const HS_ALGS: Record<string, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

async function verifyHmac(
  token: string,
  secret: string,
  alg: string
): Promise<boolean> {
  const hash = HS_ALGS[alg];
  if (!hash) throw new Error(`Unsupported algorithm for verification: ${alg}`);
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT structure");
  const data = `${parts[0]}.${parts[1]}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  const expected = new Uint8Array(sigBytes);
  const actual = base64UrlToBytes(parts[2]);
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
  return diff === 0;
}

const TIME_CLAIMS = new Set(["exp", "iat", "nbf", "auth_time", "updated_at"]);

function formatClaimValue(key: string, value: unknown): string | null {
  if (TIME_CLAIMS.has(key) && typeof value === "number") {
    const date = new Date(value * 1000);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return null;
}

export default function JwtPage() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"header" | "payload" | null>(null);
  const [verifyState, setVerifyState] = useState<
    "idle" | "valid" | "invalid" | "unsupported"
  >("idle");

  const decoded = useMemo<DecodedJwt | null>(() => {
    if (!token.trim()) {
      setError(null);
      return null;
    }
    try {
      const result = decodeJwt(token);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JWT");
      return null;
    }
  }, [token]);

  const alg = typeof decoded?.header.alg === "string" ? decoded.header.alg : "";

  const expiry = useMemo(() => {
    const exp = decoded?.payload.exp;
    if (typeof exp !== "number") return null;
    return { date: new Date(exp * 1000), expired: exp * 1000 < Date.now() };
  }, [decoded]);

  useEffect(() => {
    setVerifyState("idle");
    if (!decoded || !secret) return;
    if (!HS_ALGS[alg]) {
      setVerifyState("unsupported");
      return;
    }
    let cancelled = false;
    verifyHmac(token, secret, alg)
      .then((ok) => {
        if (!cancelled) setVerifyState(ok ? "valid" : "invalid");
      })
      .catch(() => {
        if (!cancelled) setVerifyState("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [token, secret, alg, decoded]);

  const handleCopy = (text: string, which: "header" | "payload") => {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied((prev) => (prev === which ? null : prev)), 2000);
  };

  const handleClear = () => {
    setToken("");
    setSecret("");
    setError(null);
  };

  const renderJson = (
    title: string,
    data: Record<string, unknown>,
    which: "header" | "payload"
  ) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopy(JSON.stringify(data, null, 2), which)}
        >
          {copied === which ? (
            <>
              <Check className="size-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm bg-muted overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
      <div className="flex flex-col gap-1">
        {Object.entries(data).map(([key, value]) => {
          const human = formatClaimValue(key, value);
          if (!human) return null;
          return (
            <span key={key} className="text-xs text-muted-foreground">
              <span className="font-mono">{key}</span>: {human}
            </span>
          );
        })}
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>JWT Decoder</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>JWT Token</Label>
              <textarea
                className="w-full min-h-[140px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring break-all"
                placeholder="Paste your JWT here (eyJhbGci...)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              {error && <span className="text-sm text-red-500">{error}</span>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClear}>
                  <Trash2 className="size-4" />
                  Clear
                </Button>
              </div>
            </div>

            {decoded && (
              <>
                {renderJson("Header", decoded.header, "header")}
                {renderJson("Payload", decoded.payload, "payload")}

                {expiry && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-md border text-sm ${
                      expiry.expired
                        ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                        : "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                    }`}
                  >
                    {expiry.expired ? (
                      <ShieldAlert className="size-4" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {expiry.expired
                      ? `Expired on ${expiry.date.toLocaleString()}`
                      : `Valid until ${expiry.date.toLocaleString()}`}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label>Verify Signature (HMAC only)</Label>
                  <Input
                    type="text"
                    placeholder="Enter secret for HS256 / HS384 / HS512..."
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                  {secret && verifyState === "valid" && (
                    <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <ShieldCheck className="size-4" />
                      Signature verified
                    </span>
                  )}
                  {secret && verifyState === "invalid" && (
                    <span className="flex items-center gap-2 text-sm text-red-500">
                      <ShieldAlert className="size-4" />
                      Invalid signature
                    </span>
                  )}
                  {secret && verifyState === "unsupported" && (
                    <span className="flex items-center gap-2 text-sm text-amber-500">
                      <KeyRound className="size-4" />
                      {alg
                        ? `Verification not supported for ${alg} (only HMAC)`
                        : "Unknown algorithm"}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
