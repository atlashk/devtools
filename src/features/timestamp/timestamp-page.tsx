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
import { Check, Clock, Copy, Timer } from "lucide-react";
import { useEffect, useState } from "react";

type Unit = "s" | "ms";

function toMillis(value: number, unit: Unit): number {
  return unit === "s" ? value * 1000 : value;
}

function buildRows(date: Date, unit: Unit) {
  const ms = date.getTime();
  return [
    { label: "Unix (seconds)", value: String(Math.floor(ms / 1000)) },
    { label: "Unix (milliseconds)", value: String(ms) },
    { label: "ISO 8601 (UTC)", value: date.toISOString() },
    { label: "UTC string", value: date.toUTCString() },
    { label: "Local string", value: date.toString() },
    {
      label: "Relative",
      value: formatRelative(ms),
    },
    { label: "Selected unit", value: unit === "s" ? "seconds" : "milliseconds" },
  ];
}

function formatRelative(ms: number): string {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [1000 * 60 * 60 * 24 * 365, "year"],
    [1000 * 60 * 60 * 24 * 30, "month"],
    [1000 * 60 * 60 * 24, "day"],
    [1000 * 60 * 60, "hour"],
    [1000 * 60, "minute"],
    [1000, "second"],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unitMs, unit] of units) {
    if (abs >= unitMs || unit === "second") {
      return rtf.format(Math.round(diff / unitMs), unit);
    }
  }
  return "now";
}

export default function TimestampPage() {
  const [now, setNow] = useState<number | null>(null);
  const [unit, setUnit] = useState<Unit>("s");
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [tsResult, setTsResult] = useState<Date | null>(null);
  const [tsError, setTsError] = useState<string | null>(null);
  const [dateResult, setDateResult] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((prev) => (prev === key ? null : prev)), 2000);
  };

  const convertTimestamp = (raw: string, u: Unit) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setTsResult(null);
      setTsError(null);
      return;
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      setTsError("Not a valid number");
      setTsResult(null);
      return;
    }
    const date = new Date(toMillis(num, u));
    if (Number.isNaN(date.getTime())) {
      setTsError("Out of range");
      setTsResult(null);
      return;
    }
    setTsError(null);
    setTsResult(date);
  };

  const convertDate = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setDateResult(null);
      setDateError(null);
      return;
    }
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      setDateError("Could not parse date");
      setDateResult(null);
      return;
    }
    setDateError(null);
    setDateResult(date);
  };

  const useNow = () => {
    const ms = Date.now();
    const value = unit === "s" ? Math.floor(ms / 1000) : ms;
    setTsInput(String(value));
    convertTimestamp(String(value), unit);
  };

  const handleUnitChange = (u: Unit) => {
    setUnit(u);
    if (tsInput.trim()) convertTimestamp(tsInput, u);
  };

  const ResultBlock = ({ date }: { date: Date }) => (
    <div className="flex flex-col gap-2 mt-2">
      {buildRows(date, unit).map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-muted"
        >
          <span className="text-sm text-muted-foreground shrink-0">
            {row.label}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-sm truncate">{row.value}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(row.value, row.label)}
            >
              {copied === row.label ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
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
                  <BreadcrumbPage>Timestamp Converter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-muted">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  Current Unix time (seconds)
                </span>
                <span className="text-2xl font-semibold tabular-nums">
                  {now === null ? "—" : Math.floor(now / 1000)}
                </span>
              </div>
              <Button variant="outline" onClick={useNow}>
                <Clock className="size-4" />
                Use now
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Timestamp → Date</Label>
                <div className="flex gap-1">
                  <Button
                    variant={unit === "s" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUnitChange("s")}
                  >
                    <Clock className="size-4" />
                    Seconds
                  </Button>
                  <Button
                    variant={unit === "ms" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUnitChange("ms")}
                  >
                    <Timer className="size-4" />
                    Milliseconds
                  </Button>
                </div>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                placeholder={unit === "s" ? "e.g. 1718600000" : "e.g. 1718600000000"}
                value={tsInput}
                onChange={(e) => {
                  setTsInput(e.target.value);
                  convertTimestamp(e.target.value, unit);
                }}
              />
              {tsError && <span className="text-sm text-red-500">{tsError}</span>}
              {tsResult && <ResultBlock date={tsResult} />}
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label>Date → Timestamp</Label>
              <Input
                type="text"
                placeholder="e.g. 2026-06-17T10:00:00Z or June 17, 2026"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  convertDate(e.target.value);
                }}
              />
              {dateError && (
                <span className="text-sm text-red-500">{dateError}</span>
              )}
              {dateResult && <ResultBlock date={dateResult} />}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
