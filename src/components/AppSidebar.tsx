"use client";

import { HardDrive, Image, Images } from "lucide-react";
import Link from "next/link";
import { TabType, UiStore } from "@/store/useUiStore";
import { cn } from "@/lib/utils";
import BrandMark from "./BrandMark";

const items: { id: TabType; title: string; url: string; icon: typeof Image }[] = [
  { id: "photos", title: "Photos", url: "/photos", icon: Image },
  { id: "albums", title: "Albums", url: "/albums", icon: Images },
];

export default function AppSidebar() {
  const { activeTab, setActiveTab } = UiStore();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar shrink-0">
      {/* Brand header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <BrandMark size={26} />
        <span className="font-display text-[19px] font-semibold tracking-[-0.02em] leading-none">
          Image<span className="font-normal">Gallery</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <Link
              key={item.id}
              href={item.url}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 h-11 text-[14.5px] font-medium transition-colors",
                isActive
                  ? "bg-[--brand-tint] text-[--brand-hover] font-semibold"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon
                className={cn("h-5 w-5 shrink-0", isActive ? "stroke-[2.3px]" : "stroke-2")}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Storage card */}
      <div className="mt-auto p-4">
        <div className="rounded-xl bg-muted p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-[12.5px] font-medium">Storage</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: "34%", background: "linear-gradient(90deg, var(--brand), var(--accent-green))" }}
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">5.1 GB of 15 GB used</p>
        </div>
      </div>
    </aside>
  );
}
