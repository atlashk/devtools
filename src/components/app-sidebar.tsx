import { Code2 } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/shadcn/sidebar"

const data = {
  navMain: [
    {
      title: "HTTP Client",
      url: "#",
      items: [
        {
          title: "REST",
          url: "/http-client/rest",
          isActive: false,
        },
        {
          title: "GraphQL",
          url: "/http-client/graphql",
          isActive: false,
        },
        {
          title: "gRPC",
          url: "/http-client/grpc",
          isActive: false,
        },
        {
          title: "WebSocket",
          url: "/http-client/websocket",
          isActive: false,
        },
      ],
    },
    {
      title: "Diff Checker",
      url: "/diff-checker",
      items: [],
    },
    {
      title: "JSON Formatter",
      url: "/json-formatter",
      items: [],
    },
    {
      title: "Base64",
      url: "/base64",
      items: [],
    },
    {
      title: "String Counter",
      url: "/string-counter",
      items: [],
    },
    {
      title: "JWT Decoder",
      url: "/jwt",
      items: [],
    },
    {
      title: "Timestamp Converter",
      url: "/timestamp",
      items: [],
    },
    {
      title: "UUID Generator",
      url: "/uuid",
      items: [],
    },
    {
      title: "WebP to PNG",
      url: "/webp-to-png",
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Code2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Web Developer</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
