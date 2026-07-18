"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Badge } from "@/components/ui/shadcn/badge";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Toggle } from "@/components/ui/shadcn/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import { AlertCircle, Regex } from "lucide-react";
import { useMemo, useState } from "react";

type Flag = {
  value: string;
  label: string;
  description: string;
};

const FLAGS: Flag[] = [
  { value: "g", label: "g", description: "Global — find all matches" },
  { value: "i", label: "i", description: "Case insensitive" },
  { value: "m", label: "m", description: "Multiline — ^ and $ match line breaks" },
  { value: "s", label: "s", description: "Dotall — . matches newlines" },
  { value: "u", label: "u", description: "Unicode" },
  { value: "y", label: "y", description: "Sticky — match from lastIndex" },
];

type MatchInfo = {
  match: string;
  index: number;
  groups: string[];
  namedGroups: Record<string, string> | undefined;
};

type RegexResult = {
  matches: MatchInfo[];
  error: string | null;
};

const CHEATSHEET: { token: string; meaning: string }[] = [
  { token: ".", meaning: "Any character except newline" },
  { token: "\\d", meaning: "Digit (0-9)" },
  { token: "\\w", meaning: "Word character (a-z, A-Z, 0-9, _)" },
  { token: "\\s", meaning: "Whitespace" },
  { token: "^", meaning: "Start of string / line" },
  { token: "$", meaning: "End of string / line" },
  { token: "*", meaning: "0 or more" },
  { token: "+", meaning: "1 or more" },
  { token: "?", meaning: "0 or 1 (optional)" },
  { token: "{n,m}", meaning: "Between n and m times" },
  { token: "[abc]", meaning: "Any of a, b, or c" },
  { token: "(...)", meaning: "Capture group" },
  { token: "(?<name>...)", meaning: "Named capture group" },
  { token: "a|b", meaning: "a or b" },
];

function evaluateRegex(
  pattern: string,
  flags: string,
  testString: string
): RegexResult {
  if (!pattern) {
    return { matches: [], error: null };
  }

  let regex: RegExp;
  try {
    // Ensure global flag so we can iterate all matches; we track it separately
    // to decide whether to stop after the first match.
    const isGlobal = flags.includes("g");
    const effectiveFlags = isGlobal ? flags : flags + "g";
    regex = new RegExp(pattern, effectiveFlags);
  } catch (err) {
    return {
      matches: [],
      error: err instanceof Error ? err.message : "Invalid regular expression",
    };
  }

  const matches: MatchInfo[] = [];
  const isGlobal = flags.includes("g");
  let execResult: RegExpExecArray | null;

  while ((execResult = regex.exec(testString)) !== null) {
    matches.push({
      match: execResult[0],
      index: execResult.index,
      groups: execResult.slice(1).map((g) => g ?? ""),
      namedGroups: execResult.groups ? { ...execResult.groups } : undefined,
    });

    // Avoid infinite loops on zero-length matches.
    if (execResult.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    if (!isGlobal) break;
  }

  return { matches, error: null };
}

type Segment = { text: string; matchIndex: number | null };

function buildSegments(testString: string, matches: MatchInfo[]): Segment[] {
  if (matches.length === 0) {
    return [{ text: testString, matchIndex: null }];
  }

  const segments: Segment[] = [];
  let cursor = 0;

  matches.forEach((m, i) => {
    if (m.index > cursor) {
      segments.push({ text: testString.slice(cursor, m.index), matchIndex: null });
    }
    const end = m.index + m.match.length;
    // A zero-length match has nothing to highlight.
    if (end > m.index) {
      segments.push({ text: testString.slice(m.index, end), matchIndex: i });
    }
    cursor = Math.max(cursor, end);
  });

  if (cursor < testString.length) {
    segments.push({ text: testString.slice(cursor), matchIndex: null });
  }

  return segments;
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(
    "Contact us at support@example.com or sales@test.org.\nInvalid: foo@bar"
  );

  const { matches, error } = useMemo(
    () => evaluateRegex(pattern, flags, testString),
    [pattern, flags, testString]
  );

  const segments = useMemo(
    () => buildSegments(testString, matches),
    [testString, matches]
  );

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag)
        ? prev
            .split("")
            .filter((f) => f !== flag)
            .join("")
        : prev + flag
    );
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
                  <BreadcrumbPage>Regex Tester</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Pattern + flags */}
            <div className="flex flex-col gap-2">
              <Label>Regular Expression</Label>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <span className="text-muted-foreground font-mono select-none">/</span>
                <input
                  className="flex-1 py-2 font-mono text-sm bg-transparent focus:outline-none"
                  placeholder="Enter regex pattern..."
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  spellCheck={false}
                />
                <span className="text-muted-foreground font-mono select-none">
                  /{flags}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-1">
                {FLAGS.map((flag) => (
                  <Tooltip key={flag.value}>
                    <TooltipTrigger asChild>
                      <Toggle
                        size="sm"
                        variant="outline"
                        pressed={flags.includes(flag.value)}
                        onPressedChange={() => toggleFlag(flag.value)}
                        className="font-mono data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {flag.label}
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>{flag.description}</TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test string */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Test String</Label>
                  {!error && pattern && (
                    <Badge variant="secondary">
                      {matches.length} match{matches.length === 1 ? "" : "es"}
                    </Badge>
                  )}
                </div>
                <textarea
                  className="w-full min-h-[280px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm resize-y bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter text to test against..."
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  spellCheck={false}
                />

                {/* Highlighted preview */}
                <Label className="mt-2">Highlighted Matches</Label>
                <div className="w-full min-h-[120px] p-3 border border-gray-200 dark:border-gray-700 rounded-md font-mono text-sm whitespace-pre-wrap break-words bg-muted">
                  {pattern && !error && matches.length > 0 ? (
                    segments.map((seg, i) =>
                      seg.matchIndex === null ? (
                        <span key={i}>{seg.text}</span>
                      ) : (
                        <mark
                          key={i}
                          className="rounded bg-yellow-300 text-black dark:bg-yellow-500/80 dark:text-black"
                        >
                          {seg.text}
                        </mark>
                      )
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      {error
                        ? "Fix the pattern to see matches."
                        : "No matches to highlight."}
                    </span>
                  )}
                </div>
              </div>

              {/* Match details */}
              <div className="flex flex-col gap-2">
                <Label>Match Details</Label>
                <div className="w-full min-h-[280px] max-h-[440px] overflow-auto p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-muted flex flex-col gap-3">
                  {!pattern ? (
                    <span className="text-sm text-muted-foreground">
                      Enter a pattern to see match details.
                    </span>
                  ) : error ? (
                    <span className="text-sm text-muted-foreground">
                      Fix the pattern to see match details.
                    </span>
                  ) : matches.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No matches found.
                    </span>
                  ) : (
                    matches.map((m, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-gray-200 dark:border-gray-700 bg-background p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Match {i + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            index {m.index}
                          </span>
                        </div>
                        <code className="font-mono text-sm break-all rounded bg-yellow-300/40 dark:bg-yellow-500/30 px-1.5 py-0.5 w-fit">
                          {m.match || "(empty match)"}
                        </code>

                        {m.groups.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Groups
                            </span>
                            {m.groups.map((g, gi) => (
                              <div
                                key={gi}
                                className="flex items-baseline gap-2 text-sm"
                              >
                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                  ${gi + 1}
                                </span>
                                <code className="font-mono break-all">
                                  {g || <span className="text-muted-foreground">(empty)</span>}
                                </code>
                              </div>
                            ))}
                          </div>
                        )}

                        {m.namedGroups &&
                          Object.keys(m.namedGroups).length > 0 && (
                            <div className="flex flex-col gap-1 mt-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Named Groups
                              </span>
                              {Object.entries(m.namedGroups).map(
                                ([name, val]) => (
                                  <div
                                    key={name}
                                    className="flex items-baseline gap-2 text-sm"
                                  >
                                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                                      {name}
                                    </span>
                                    <code className="font-mono break-all">
                                      {val || (
                                        <span className="text-muted-foreground">
                                          (empty)
                                        </span>
                                      )}
                                    </code>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Cheatsheet */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <Regex className="size-4" />
                Quick Reference
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {CHEATSHEET.map((item) => (
                  <div
                    key={item.token}
                    className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-background px-3 py-2 text-sm"
                  >
                    <code className="font-mono text-primary shrink-0">
                      {item.token}
                    </code>
                    <span className="text-muted-foreground text-xs">
                      {item.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
