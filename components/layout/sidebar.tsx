"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Building2, UtensilsCrossed, Car, Settings, ChevronDown, Sparkles } from "lucide-react"
import { useAuthStore } from "@/core/lib/store"
import { cn } from "@/core/lib/utils"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface MenuItem {
  label: string
  icon: React.ElementType
  href: string
  module: "hotel" | "restaurant" | "travel"
  subItems?: { label: string; href: string }[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Hotels",
    icon: Building2,
    href: "/dashboard/hotels",
    module: "hotel",
    subItems: [
      { label: "Categories", href: "/dashboard/hotels/categories" },
      { label: "Amenities", href: "/dashboard/hotels/amenities" },
      { label: "Rooms", href: "/dashboard/hotels/rooms" },
      { label: "Bookings", href: "/dashboard/hotels/bookings" },
      { label: "Room POS", href: "/dashboard/hotels/room-pos" },
    ],
  },
  {
    label: "Restaurants",
    icon: UtensilsCrossed,
    href: "/dashboard/restaurants",
    module: "restaurant",
    subItems: [
      { label: "Categories", href: "/dashboard/restaurants/categories" },
      { label: "Sub Categories", href: "/dashboard/restaurants/sub-categories" },
      { label: "Menu Items", href: "/dashboard/restaurants/menu-items" },
      { label: "Orders", href: "/dashboard/restaurants/orders" },
      { label: "KOT", href: "/dashboard/restaurants/kot" },
    ],
  },
  {
    label: "Travel Agencies",
    icon: Car,
    href: "/dashboard/travel",
    module: "travel",
    subItems: [{ label: "Vehicles", href: "/dashboard/travel/vehicles" }],
  },
]

export function Sidebar({ ...props }: React.ComponentProps<typeof ShadcnSidebar>) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  const userModules = new Set(user.modules)
  const filteredItems = MENU_ITEMS.filter((item) => userModules.has(item.module) || true)

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href)
  }

  return (
    <ShadcnSidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Vendor Hub</span>
            <span className="truncate text-xs">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <Collapsible
              key={item.label}
              asChild
              defaultOpen={isActive(item.href)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.label}
                    onClick={() => {
                      // Toggle behavior is handled by CollapsibleTrigger
                    }}
                    isActive={isActive(item.href)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.subItems?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                          <Link href={subItem.href}>
                            <span>{subItem.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")} tooltip="Profile">
              <Link href="/dashboard/profile">
                <Settings />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  )
}
