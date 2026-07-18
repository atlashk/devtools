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
import { Check, Copy, Minus, RefreshCw, Type } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const MAX_COUNT = 100;

function generateUuids(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

export default function UuidPage() {
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = useCallback(() => {
    const safeCount = Math.min(Math.max(1, count), MAX_COUNT);
    setUuids(generateUuids(safeCount));
  }, [count]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const format = (uuid: string): string => {
    let result = hyphens ? uuid : uuid.replace(/-/g, "");
    if (uppercase) result = result.toUpperCase();
    return result;
  };

  const formatted = uuids.map(format);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(
      () => setCopiedIndex((prev) => (prev === index ? null : prev)),
      2000
    );
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(formatted.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
                  <BreadcrumbPage>UUID Generator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="uuid-count">Count (1–{MAX_COUNT})</Label>
                <Input
                  id="uuid-count"
                  type="number"
                  min={1}
                  max={MAX_COUNT}
                  className="w-32"
                  value={count}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setCount(Number.isNaN(n) ? 1 : n);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Button
                    variant={hyphens ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHyphens((v) => !v)}
                  >
                    <Minus className="size-4" />
                    Hyphens
                  </Button>
                  <Button
                    variant={uppercase ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUppercase((v) => !v)}
                  >
                    <Type className="size-4" />
                    Uppercase
                  </Button>
                </div>
              </div>

              <Button onClick={generate}>
                <RefreshCw className="size-4" />
                Generate
              </Button>
            </div>

            {formatted.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>
                    {formatted.length} UUID{formatted.length > 1 ? "s" : ""} (v4)
                  </Label>
                  <Button variant="outline" size="sm" onClick={handleCopyAll}>
                    {copiedAll ? (
                      <>
                        <Check className="size-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy all
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-col gap-1">
                  {formatted.map((uuid, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-muted"
                    >
                      <span className="font-mono text-sm truncate">{uuid}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(uuid, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
