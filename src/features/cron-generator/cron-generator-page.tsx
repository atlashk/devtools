"use client";

import { useMemo, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { CopyButton } from "@/components/ui/copy-button";
import { CronFieldEditor } from "./components/cron-field-editor";
import { buildCronExpression } from "./utils/build-expression";
import { describeCron } from "./utils/describe-cron";
import {
  FIELD_CONFIGS,
  FIELD_ORDER,
  createDefaultCronState,
} from "./utils/field-config";
import { CRON_PRESETS } from "./utils/presets";
import type { CronState } from "./types";

export default function CronGeneratorPage() {
  const [fields, setFields] = useState<CronState>(createDefaultCronState);

  const expression = useMemo(() => buildCronExpression(fields), [fields]);
  const description = useMemo(() => describeCron(fields), [fields]);

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
                  <BreadcrumbPage>Cron Generator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_2fr] gap-6 items-start">
            <div className="flex flex-col gap-6">
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <span className="text-sm font-medium">Presets</span>
                  <div className="flex flex-wrap gap-2">
                    {CRON_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setFields(preset.build())}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col gap-6">
                  {FIELD_ORDER.map((key, i) => (
                    <div key={key} className="flex flex-col gap-6">
                      {i > 0 && <Separator />}
                      <CronFieldEditor
                        config={FIELD_CONFIGS[key]}
                        state={fields[key]}
                        onChange={(state) =>
                          setFields((prev) => ({ ...prev, [key]: state }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="lg:sticky lg:top-6">
              <CardContent className="flex flex-col gap-3">
                <span className="text-sm font-medium">Cron expression</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-muted font-mono text-base tracking-wide select-all">
                    {expression}
                  </div>
                  <CopyButton value={expression} variant="outline" disabled={!expression} />
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
