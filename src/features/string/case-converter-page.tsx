"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Check, Copy, Eraser } from "lucide-react";
import { useMemo, useState } from "react";

function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toCamelCase(input: string): string {
  return splitWords(input)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
}

function toCapitalizeCase(input: string): string {
  return splitWords(input)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function toSnakeCase(input: string): string {
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join("_");
}

const caseTypes = [
  { id: "lower", label: "lowercase", convert: (s: string) => s.toLowerCase() },
  { id: "upper", label: "UPPERCASE", convert: (s: string) => s.toUpperCase() },
  { id: "camel", label: "camelCase", convert: toCamelCase },
  { id: "capitalize", label: "Capitalize Case", convert: toCapitalizeCase },
  { id: "snake", label: "snake_case", convert: toSnakeCase },
] as const;

type CaseId = (typeof caseTypes)[number]["id"];

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseId>("lower");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    const caseType = caseTypes.find((c) => c.id === activeCase);
    return caseType ? caseType.convert(input) : "";
  }, [input, activeCase]);

  const handleClear = () => {
    setInput("");
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">String</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Case Converter</BreadcrumbPage>
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
                className="w-full min-h-[160px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type or paste text to convert..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button variant="outline" className="w-fit" onClick={handleClear}>
                <Eraser className="size-4" />
                Clear
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Case</Label>
              <div className="flex flex-wrap gap-2">
                {caseTypes.map((caseType) => (
                  <Button
                    key={caseType.id}
                    variant={activeCase === caseType.id ? "default" : "outline"}
                    onClick={() => setActiveCase(caseType.id)}
                  >
                    {caseType.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Output</Label>
              <textarea
                className="w-full min-h-[160px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-muted focus:outline-none"
                readOnly
                value={output}
              />
              <Button
                variant="outline"
                className="w-fit"
                onClick={handleCopy}
                disabled={!output}
              >
                {copied ? (
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
