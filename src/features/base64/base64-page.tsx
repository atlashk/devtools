"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { Binary, Check, Copy, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Base64Page() {
  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"encode" | "decode" | null>(null);
  const { handleError } = useErrorHandler();

  const handleCopy = (text: string, tab: "encode" | "decode") => {
    navigator.clipboard.writeText(text);
    setCopied(tab);
    setTimeout(() => setCopied((prev) => (prev === tab ? null : prev)), 2000);
  };

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(encodeInput)));
      setEncodeOutput(encoded);
    } catch (err) {
      handleError(err, "Base64 Encode");
    }
  };

  const handleDecode = () => {
    try {
      setDecodeError(null);
      const decoded = decodeURIComponent(escape(atob(decodeInput.trim())));
      setDecodeOutput(decoded);
    } catch {
      setDecodeError("Invalid Base64 string");
      setDecodeOutput("");
    }
  };

  const handleClear = (tab: "encode" | "decode") => {
    if (tab === "encode") {
      setEncodeInput("");
      setEncodeOutput("");
    } else {
      setDecodeInput("");
      setDecodeOutput("");
      setDecodeError(null);
    }
  };

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
                  <BreadcrumbPage>Base64</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="encode">
              <TabsList className="mb-6">
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>

              <TabsContent value="encode" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Input Text</Label>
                  <textarea
                    className="w-full min-h-[160px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter text to encode..."
                    value={encodeInput}
                    onChange={(e) => setEncodeInput(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEncode}>
                    <Binary className="size-4" />
                    Encode
                  </Button>
                  <Button variant="outline" onClick={() => handleClear("encode")}>
                    <Trash2 className="size-4" />
                    Clear
                  </Button>
                </div>
                {encodeOutput && (
                  <div className="flex flex-col gap-2">
                    <Label>Base64 Output</Label>
                    <textarea
                      className="w-full min-h-[160px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-muted focus:outline-none"
                      readOnly
                      value={encodeOutput}
                    />
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => handleCopy(encodeOutput, "encode")}
                    >
                      {copied === "encode" ? (
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
                )}
              </TabsContent>

              <TabsContent value="decode" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Base64 Input</Label>
                  <textarea
                    className="w-full min-h-[160px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter Base64 string to decode..."
                    value={decodeInput}
                    onChange={(e) => { setDecodeInput(e.target.value); setDecodeError(null); }}
                  />
                  {decodeError && (
                    <span className="text-sm text-red-500">{decodeError}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDecode}>
                    <FileText className="size-4" />
                    Decode
                  </Button>
                  <Button variant="outline" onClick={() => handleClear("decode")}>
                    <Trash2 className="size-4" />
                    Clear
                  </Button>
                </div>
                {decodeOutput && (
                  <div className="flex flex-col gap-2">
                    <Label>Decoded Output</Label>
                    <textarea
                      className="w-full min-h-[160px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-muted focus:outline-none"
                      readOnly
                      value={decodeOutput}
                    />
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => handleCopy(decodeOutput, "decode")}
                    >
                      {copied === "decode" ? (
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
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
