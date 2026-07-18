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
import { Eraser } from "lucide-react";
import { useMemo, useState } from "react";

export default function StringCounterPage() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, "").length;
    const words = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
    const lines = input === "" ? 0 : input.split(/\r\n|\r|\n/).length;
    const bytes = new TextEncoder().encode(input).length;
    return { characters, charactersNoSpaces, words, lines, bytes };
  }, [input]);

  const handleClear = () => setInput("");

  const items = [
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
    { label: "Bytes (UTF-8)", value: stats.bytes },
  ];

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
                  <BreadcrumbPage>String Counter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>Input Text</Label>
              <textarea
                className="w-full min-h-[200px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type or paste text to count..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button variant="outline" className="w-fit" onClick={handleClear}>
                <Eraser className="size-4" />
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-muted"
                >
                  <span className="text-2xl font-semibold tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
