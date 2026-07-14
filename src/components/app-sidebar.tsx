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
      title: "String",
      url: "/string",
      items: [
        {
          title: "String Counter",
          url: "/string/counter",
          isActive: false,
        },
        {
          title: "Diff Checker",
          url: "/string/diff-checker",
          isActive: false,
        },
      ],
    },
    {
      title: "JSON",
      url: "/json",
      items: [
        {
          title: "JSON Formatter",
          url: "/json/formatter",
          isActive: false,
        },
      ],
    },
    {
      title: "Cryptography",
      url: "/cryptography",
      items: [
        {
          title: "Base64",
          url: "/cryptography/base64",
          isActive: false,
        },
        {
          title: "Bcrypt",
          url: "/cryptography/bcrypt",
          isActive: false,
        },
        {
          title: "JWT",
          url: "/cryptography/jwt",
          isActive: false,
        },
      ],
    },
    {
      title: "Timestamp",
      url: "/timestamp",
      items: [],
    },
    {
      title: "UUID",
      url: "/uuid",
      items: [],
    },
    {
      title: "Markdown",
      url: "/markdown",
      items: [
        {
          title: "HTML to Markdown",
          url: "/markdown/html-to-markdown",
          isActive: false,
        },
      ],
    },
    {
      title: "Image Converter",
      url: "/image-converter",
      items: [
        {
          title: "WebP to PNG",
          url: "/image-converter/webp-to-png",
          isActive: false,
        },
        {
          title: "JPG to PNG",
          url: "/image-converter/jpg-to-png",
          isActive: false,
        },
        {
          title: "PNG to JPG",
          url: "/image-converter/png-to-jpg",
          isActive: false,
        },
      ],
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
