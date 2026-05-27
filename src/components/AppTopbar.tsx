"use client";

import { User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";
import { AuthStore } from "@/store/useAuthStore";
import { Button } from "./ui/button";
import Link from "next/link";

function getUserInitials(name: string) {
  const parts = name.split(' ');
  if (parts.length === 2) {
    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  } else {
    return parts.slice(0, 2).map(ch => ch.toUpperCase()).join('');
  }
}

export default function AppTopbar() {
  const user = AuthStore(state => state.user);

  return (
    <div className="border-b h-14 flex items-center justify-between px-4">
      <SidebarTrigger />
      <span>App Topbar</span>

      {user ? (
        <DropdownMenu>

          {/* 1. The Clickable Profile Trigger */}
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0">
            <Avatar className="h-9 w-9 border border-border cursor-pointer hover:opacity-90 transition-opacity">
              <AvatarImage src="https://github.com" alt="User Profile" />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          {/* 2. The Floating Dropdown Menu Container */}
          <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">johndoe@example.com</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Navigation Options */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 py-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Log Out Destructive Action */}
            <DropdownMenuItem
              onClick={() => console.log(111)}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 py-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant={"outline"} className="bg-blue-500 text-white hover:text-white hover:bg-blue-600 focus-visible:ring-blue-500">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div >
  );
}
