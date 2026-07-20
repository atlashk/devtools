"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Code2 } from "lucide-react";

export default function HomePage() {
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
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-6 pb-24">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-12 items-center justify-center rounded-lg">
              <Code2 className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">DevTools</h1>
              <p className="text-muted-foreground text-sm">
                A collection of handy, client-side tools for everyday
                development work.
              </p>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
