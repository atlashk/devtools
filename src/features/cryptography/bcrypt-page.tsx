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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
import { useErrorHandler } from "@/hooks/use-error-handler";
import bcrypt from "bcryptjs";
import { Check, Copy, Eraser, KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function BcryptPage() {
  const [hashInput, setHashInput] = useState("");
  const [rounds, setRounds] = useState("10");
  const [hashOutput, setHashOutput] = useState("");
  const [hashing, setHashing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [compareString, setCompareString] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [comparing, setComparing] = useState(false);
  const [matchResult, setMatchResult] = useState<"match" | "no-match" | null>(null);

  const { handleError } = useErrorHandler();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHash = async () => {
    if (!hashInput) return;
    setHashing(true);
    try {
      const hashed = await bcrypt.hash(hashInput, Number(rounds));
      setHashOutput(hashed);
    } catch (err) {
      handleError(err, "Bcrypt Hash");
    } finally {
      setHashing(false);
    }
  };

  const handleClearHash = () => {
    setHashInput("");
    setHashOutput("");
  };

  const handleCompare = async () => {
    if (!compareString || !compareHash) return;
    setComparing(true);
    setMatchResult(null);
    try {
      const ok = await bcrypt.compare(compareString, compareHash);
      setMatchResult(ok ? "match" : "no-match");
    } catch (err) {
      handleError(err, "Bcrypt Compare");
    } finally {
      setComparing(false);
    }
  };

  const handleClearCompare = () => {
    setCompareString("");
    setCompareHash("");
    setMatchResult(null);
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
                  <BreadcrumbPage>Bcrypt</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="hash">
              <TabsList className="mb-6">
                <TabsTrigger value="hash">Hash</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
              </TabsList>

              <TabsContent value="hash" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Input Text</Label>
                  <textarea
                    className="w-full min-h-[120px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter text to hash..."
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 max-w-[200px]">
                  <Label>Salt Rounds</Label>
                  <Select value={rounds} onValueChange={setRounds}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[8, 10, 12, 14].map((r) => (
                        <SelectItem key={r} value={String(r)}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleHash} disabled={!hashInput || hashing}>
                    <KeyRound className="size-4" />
                    {hashing ? "Hashing..." : "Hash"}
                  </Button>
                  <Button variant="outline" onClick={handleClearHash}>
                    <Eraser className="size-4" />
                    Clear
                  </Button>
                </div>
                {hashOutput && (
                  <div className="flex flex-col gap-2">
                    <Label>Bcrypt Hash</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-muted focus:outline-none break-all"
                      readOnly
                      value={hashOutput}
                    />
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => handleCopy(hashOutput)}
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
                )}
              </TabsContent>

              <TabsContent value="compare" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Plain Text</Label>
                  <Input
                    type="text"
                    placeholder="Enter plain text to check..."
                    value={compareString}
                    onChange={(e) => {
                      setCompareString(e.target.value);
                      setMatchResult(null);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Bcrypt Hash</Label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring break-all"
                    placeholder="Enter Bcrypt hash to compare against (e.g. $2b$10$...)"
                    value={compareHash}
                    onChange={(e) => {
                      setCompareHash(e.target.value);
                      setMatchResult(null);
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCompare}
                    disabled={!compareString || !compareHash || comparing}
                  >
                    <ShieldCheck className="size-4" />
                    {comparing ? "Comparing..." : "Compare"}
                  </Button>
                  <Button variant="outline" onClick={handleClearCompare}>
                    <Eraser className="size-4" />
                    Clear
                  </Button>
                </div>
                {matchResult === "match" && (
                  <div className="flex items-center gap-2 p-3 rounded-md border text-sm border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                    <ShieldCheck className="size-4" />
                    Match — the text matches the hash
                  </div>
                )}
                {matchResult === "no-match" && (
                  <div className="flex items-center gap-2 p-3 rounded-md border text-sm border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                    <ShieldAlert className="size-4" />
                    No match — the text does not match the hash
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
