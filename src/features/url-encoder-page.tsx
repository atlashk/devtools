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
import { Check, Copy, Eraser, FileText, Link2 } from "lucide-react";
import { useState } from "react";

export default function UrlEncoderPage() {
  const [encodeInput, setEncodeInput] = useState(
    "https://example.com/search?q=hello world&lang=en"
  );
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInput] = useState(
    "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26lang%3Den"
  );
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
      setEncodeOutput(encodeURIComponent(encodeInput));
    } catch (err) {
      handleError(err, "URL Encode");
    }
  };

  const handleDecode = () => {
    try {
      setDecodeError(null);
      setDecodeOutput(decodeURIComponent(decodeInput));
    } catch {
      setDecodeError("Invalid URL-encoded string");
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
                  <BreadcrumbPage>URL Encoder / Decoder</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="encode">
              <TabsList className="mb-6">
                <TabsTrigger value="encode">Encode</TabsTrigger>
                <TabsTrigger value="decode">Decode</TabsTrigger>
              </TabsList>

              <TabsContent value="encode" className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Input Text</Label>
                    <textarea
                      className="w-full min-h-[300px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter text or URL to encode..."
                      value={encodeInput}
                      onChange={(e) => setEncodeInput(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleEncode}>
                        <Link2 className="size-4" />
                        Encode
                      </Button>
                      <Button variant="outline" onClick={() => handleClear("encode")}>
                        <Eraser className="size-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Encoded Output</Label>
                    <textarea
                      className="w-full min-h-[300px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-muted focus:outline-none"
                      readOnly
                      placeholder="Encoded result will appear here..."
                      value={encodeOutput}
                    />
                    <Button
                      variant="outline"
                      className="w-fit"
                      disabled={!encodeOutput}
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
                </div>
              </TabsContent>

              <TabsContent value="decode" className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>URL-encoded Input</Label>
                    <textarea
                      className="w-full min-h-[300px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Enter URL-encoded string to decode..."
                      value={decodeInput}
                      onChange={(e) => { setDecodeInput(e.target.value); setDecodeError(null); }}
                    />
                    {decodeError && (
                      <span className="text-sm text-red-500">{decodeError}</span>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleDecode}>
                        <FileText className="size-4" />
                        Decode
                      </Button>
                      <Button variant="outline" onClick={() => handleClear("decode")}>
                        <Eraser className="size-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Decoded Output</Label>
                    <textarea
                      className="w-full min-h-[300px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-muted focus:outline-none"
                      readOnly
                      placeholder="Decoded result will appear here..."
                      value={decodeOutput}
                    />
                    <Button
                      variant="outline"
                      className="w-fit"
                      disabled={!decodeOutput}
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
