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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { Check, Copy, HardDrive } from "lucide-react";
import { useMemo, useState } from "react";

type UnitDef = {
  id: string;
  label: string;
  /** Number of bytes in one of this unit. */
  bytes: number;
  system: "decimal" | "binary" | "base";
};

// Decimal units use powers of 1000, binary units use powers of 1024.
const UNITS: UnitDef[] = [
  { id: "B", label: "Byte (B)", bytes: 1, system: "base" },
  { id: "KB", label: "Kilobyte (KB)", bytes: 1e3, system: "decimal" },
  { id: "MB", label: "Megabyte (MB)", bytes: 1e6, system: "decimal" },
  { id: "GB", label: "Gigabyte (GB)", bytes: 1e9, system: "decimal" },
  { id: "TB", label: "Terabyte (TB)", bytes: 1e12, system: "decimal" },
  { id: "PB", label: "Petabyte (PB)", bytes: 1e15, system: "decimal" },
  { id: "KiB", label: "Kibibyte (KiB)", bytes: 1024, system: "binary" },
  { id: "MiB", label: "Mebibyte (MiB)", bytes: 1024 ** 2, system: "binary" },
  { id: "GiB", label: "Gibibyte (GiB)", bytes: 1024 ** 3, system: "binary" },
  { id: "TiB", label: "Tebibyte (TiB)", bytes: 1024 ** 4, system: "binary" },
  { id: "PiB", label: "Pebibyte (PiB)", bytes: 1024 ** 5, system: "binary" },
];

const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));

/** Format a number without scientific notation, trimming trailing zeros. */
function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  // Keep enough precision for very small or very large values.
  const maxDigits = abs < 1 ? 20 : 6;
  const str = value.toLocaleString("en-US", {
    maximumFractionDigits: maxDigits,
    useGrouping: false,
  });
  return str;
}

export default function StorageConverterPage() {
  const [value, setValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("MB");
  const [copied, setCopied] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return { bytes: null as number | null, error: null };
    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      return { bytes: null, error: "Not a valid number" };
    }
    if (num < 0) {
      return { bytes: null, error: "Value must be non-negative" };
    }
    const unit = UNIT_BY_ID.get(fromUnit)!;
    return { bytes: num * unit.bytes, error: null };
  }, [value, fromUnit]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((prev) => (prev === key ? null : prev)), 2000);
  };

  const rows =
    parsed.bytes === null
      ? []
      : UNITS.map((u) => ({
          unit: u,
          value: formatNumber(parsed.bytes! / u.bytes),
        }));

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
                  <BreadcrumbPage>Storage Converter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>Value</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 1024"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="flex-1"
                />
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger className="sm:w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {parsed.error && (
                <span className="text-sm text-red-500">{parsed.error}</span>
              )}
            </div>

            {rows.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="size-4" />
                  Equivalent values
                </div>
                <div className="flex flex-col gap-2">
                  {rows.map((row) => (
                    <div
                      key={row.unit.id}
                      className="flex items-center justify-between gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-muted"
                    >
                      <span className="text-sm text-muted-foreground shrink-0 w-40">
                        {row.unit.label}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-sm truncate">
                          {row.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(row.value, row.unit.id)}
                        >
                          {copied === row.unit.id ? (
                            <Check className="size-4 text-green-500" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Decimal units (KB, MB, …) use powers of 1000; binary units
                  (KiB, MiB, GiB, …) use powers of 1024.
                </p>
              </>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
