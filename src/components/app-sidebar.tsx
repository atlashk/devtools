import { Code2, Search } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
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
      title: "Base64 Encoder / Decoder",
      url: "/base64-encoder-decoder",
      items: [],
    },
    {
      title: "Bcrypt",
      url: "/bcrypt",
      items: [],
    },
    {
      title: "URL Encoder / Decoder",
      url: "/url-encoder-decoder",
      items: [],
    },
    {
      title: "JWT Decoder",
      url: "/jwt-decoder",
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
      title: "Storage Converter",
      url: "/storage-converter",
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

function filterNavMain(items: typeof data.navMain, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return items

  return items.reduce<typeof data.navMain>((acc, item) => {
    const parentMatches = item.title.toLowerCase().includes(q)
    const matchedItems = item.items.filter((subItem) =>
      subItem.title.toLowerCase().includes(q),
    )

    if (parentMatches) {
      acc.push(item)
    } else if (matchedItems.length > 0) {
      acc.push({ ...item, items: matchedItems })
    }

    return acc
  }, [])
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [search, setSearch] = React.useState("")
  const filteredNavMain = React.useMemo(
    () => filterNavMain(data.navMain, search),
    [search],
  )

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
                  <span className="font-medium">DevTools</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          <SidebarInput
            placeholder="Search tools..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredNavMain.length === 0 ? (
              <div className="text-sidebar-foreground/70 px-2 py-1.5 text-sm">
                No tools found.
              </div>
            ) : null}
            {filteredNavMain.map((item) => (
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
