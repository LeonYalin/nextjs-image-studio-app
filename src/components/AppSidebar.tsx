"use client";

import { FolderOpen, Image, Aperture } from "lucide-react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
// import { usePathname } from "next/navigation";
import { TabType, UiStore } from "@/store/useUiStore";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const items: { id: TabType, title: string, url: string, icon: typeof Image; }[] = [
  {
    id: 'photos',
    title: "Photos",
    url: "/photos",
    icon: Image,
  },
  {
    id: 'albums',
    title: "Albums",
    url: "/albums",
    icon: FolderOpen,
  }
];

export default function AppSidebar({ className }: Props) {
  // const pathname = usePathname();
  const { activeTab, setActiveTab } = UiStore();

  return (
    <Sidebar className={className}>
      <SidebarHeader className="border-b flex justify-center pl-4 h-14">
        <Link href="/" className="flex gap-2 items-center">
          <Aperture className="h-6 w-6 text-red-600" />
          <span>
            <span className="font-semibold text-lg tracking-tight text-yellow-600">Image</span>
            <span className="font-semibold text-lg tracking-tight text-blue-600">Gallery</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // const isActive = pathname === item.url;
                const isActive = item.id === activeTab;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className={cn({
                      'data-[active=true]:bg-blue-50 data-[active=true]:hover:bg-blue-100 data-[active=true]:text-blue-600 data-[active=true]:hover:text-blue-700 font-semibold': isActive
                    })}>
                      <Link href={item.url} onClick={() => setActiveTab(item.id)}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
