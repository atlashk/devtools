"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Slider } from "@/components/ui/shadcn/slider";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { cn } from "@/utils/utils";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const MIN_LENGTH = 4;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;
const AMBIGUOUS_CHARS = "Il1O0o";

type CharSetKey = "uppercase" | "lowercase" | "numbers" | "symbols";

const CHAR_SETS: Record<
  CharSetKey,
  { label: string; sample: string; chars: string }
> = {
  uppercase: { label: "Uppercase (A-Z)", sample: "ABC", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  lowercase: { label: "Lowercase (a-z)", sample: "abc", chars: "abcdefghijklmnopqrstuvwxyz" },
  numbers: { label: "Numbers (0-9)", sample: "123", chars: "0123456789" },
  symbols: { label: "Symbols (!@#...)", sample: "!@#", chars: "!@#$%^&*()_+-=[]{}|;:,.<>?" },
};

/** Rejection-sampled random int in [0, max) using crypto.getRandomValues to avoid modulo bias. */
function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value: number;
  do {
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= limit);
  return value % max;
}

function shuffle(chars: string[]): string[] {
  const result = [...chars];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generates a password guaranteeing at least one char from each selected pool. */
function generatePassword(length: number, pools: string[]): string {
  if (pools.length === 0) return "";

  const chars: string[] = [];
  for (const pool of pools) {
    if (chars.length >= length) break;
    chars.push(pool[secureRandomInt(pool.length)]);
  }

  const combined = pools.join("");
  while (chars.length < length) {
    chars.push(combined[secureRandomInt(combined.length)]);
  }

  return shuffle(chars).join("");
}

type Strength = {
  label: string;
  score: number; // 0-4
  barColor: string;
  textColor: string;
};

function calculateStrength(length: number, poolSize: number): Strength {
  const entropy = poolSize > 0 ? length * Math.log2(poolSize) : 0;

  if (entropy < 40) {
    return { label: "Weak", score: 1, barColor: "bg-red-500", textColor: "text-red-500" };
  }
  if (entropy < 60) {
    return { label: "Fair", score: 2, barColor: "bg-orange-500", textColor: "text-orange-500" };
  }
  if (entropy < 80) {
    return { label: "Good", score: 3, barColor: "bg-yellow-500", textColor: "text-yellow-500" };
  }
  return { label: "Strong", score: 4, barColor: "bg-green-500", textColor: "text-green-500" };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [selected, setSelected] = useState<Record<CharSetKey, boolean>>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const { handleError } = useErrorHandler();

  const pools = useMemo(() => {
    return (Object.keys(CHAR_SETS) as CharSetKey[])
      .filter((key) => selected[key])
      .map((key) => {
        const chars = CHAR_SETS[key].chars;
        return excludeAmbiguous
          ? chars
              .split("")
              .filter((c) => !AMBIGUOUS_CHARS.includes(c))
              .join("")
          : chars;
      })
      .filter((pool) => pool.length > 0);
  }, [selected, excludeAmbiguous]);

  const poolSize = useMemo(
    () => new Set(pools.join("").split("")).size,
    [pools]
  );

  const strength = useMemo(
    () => calculateStrength(length, poolSize),
    [length, poolSize]
  );

  const generate = useCallback(() => {
    if (pools.length === 0) {
      setPassword("");
      handleError(
        new Error("Select at least one character type"),
        "Password Generator"
      );
      return;
    }
    setPassword(generatePassword(length, pools));
  }, [length, pools, handleError]);

  useEffect(() => {
    if (pools.length === 0) {
      setPassword("");
      return;
    }
    setPassword(generatePassword(length, pools));
  }, [length, pools]);

  const toggleSet = (key: CharSetKey) => {
    setSelected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const remainingSelected = Object.values(next).some(Boolean);
      return remainingSelected ? next : prev;
    });
  };

  const handleLengthInput = (value: string) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    setLength(Math.min(Math.max(MIN_LENGTH, n), MAX_LENGTH));
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
                  <BreadcrumbPage>Password Generator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-muted font-mono text-base tracking-wide break-all select-all">
                    {password || (
                      <span className="text-muted-foreground text-sm select-none">
                        Select at least one character type
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generate}
                    disabled={pools.length === 0}
                  >
                    <RefreshCw className="size-4" />
                    Refresh
                  </Button>
                  <CopyButton
                    value={password}
                    variant="outline"
                    disabled={!password}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 flex gap-1">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full bg-muted",
                          i < strength.score && password && strength.barColor
                        )}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium w-12 text-right",
                      password ? strength.textColor : "text-muted-foreground"
                    )}
                  >
                    {password ? strength.label : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-length">Length</Label>
                    <Input
                      id="password-length"
                      type="number"
                      min={MIN_LENGTH}
                      max={MAX_LENGTH}
                      className="w-20"
                      value={length}
                      onChange={(e) => handleLengthInput(e.target.value)}
                    />
                  </div>
                  <Slider
                    min={MIN_LENGTH}
                    max={MAX_LENGTH}
                    step={1}
                    value={[length]}
                    onValueChange={([v]) => setLength(v)}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Character types</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(CHAR_SETS) as CharSetKey[]).map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <Checkbox
                          id={`charset-${key}`}
                          checked={selected[key]}
                          onCheckedChange={() => toggleSet(key)}
                        />
                        <Label
                          htmlFor={`charset-${key}`}
                          className="flex-1 font-normal cursor-pointer"
                        >
                          {CHAR_SETS[key].label}
                        </Label>
                        <span className="font-mono text-xs text-muted-foreground">
                          {CHAR_SETS[key].sample}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="exclude-ambiguous"
                    checked={excludeAmbiguous}
                    onCheckedChange={(v) => setExcludeAmbiguous(v === true)}
                  />
                  <Label
                    htmlFor="exclude-ambiguous"
                    className="font-normal cursor-pointer"
                  >
                    Exclude ambiguous characters (
                    <span className="font-mono">{AMBIGUOUS_CHARS}</span>)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
