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
      url: "/http-client",
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
      title: "String Counter",
      url: "/string-counter",
      items: [],
    },
    {
      title: "Diff Checker",
      url: "/diff-checker",
      items: [],
    },
    {
      title: "Regex Tester",
      url: "/regex-tester",
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
      title: "Bcrypt",
      url: "/bcrypt",
      items: [],
    },
    {
      title: "URL Encoder / Decoder",
      url: "/url-encoder",
      items: [],
    },
    {
      title: "JWT",
      url: "/jwt",
      items: [],
    },
    {
      title: "Timestamp Converter",
      url: "/timestamp-converter",
      items: [],
    },
    {
      title: "UUID Generator",
      url: "/uuid-generator",
      items: [],
    },
    {
      title: "Password Generator",
      url: "/password-generator",
      items: [],
    },
    {
      title: "Cron Generator",
      url: "/cron-generator",
      items: [],
    },
    {
      title: "HTML to Markdown",
      url: "/html-to-markdown",
      items: [],
    },
    {
      title: "WebP to PNG",
      url: "/webp-to-png",
      items: [],
    },
    {
      title: "JPG to PNG",
      url: "/jpg-to-png",
      items: [],
    },
    {
      title: "PNG to JPG",
      url: "/png-to-jpg",
      items: [],
    },
    {
      title: "Image Resizer",
      url: "/image-resizer",
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
                  <span className="font-medium">Developer Tools</span>
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
                {item.items?.length ? (
                  <div className="text-sidebar-foreground/70 flex h-8 items-center px-2 text-sm font-medium">
                    {item.title}
                  </div>
                ) : (
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium">
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                )}
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
