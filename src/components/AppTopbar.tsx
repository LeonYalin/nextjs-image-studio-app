"use client";

import { logoutAction } from "@/lib/actions";
import { LogOut, Settings, User } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import TopbarUploadButton from "./TopbarUploadButton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";

function getUserInitials(name: string) {
  const parts = name.split(' ');
  if (parts.length === 2) {
    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  } else {
    return parts.slice(0, 2).map(ch => ch.toUpperCase()).join('');
  }
}

export default function AppTopbar() {
  const { data: session } = useSession();

  return (
    <div className="border-b h-14 flex items-center justify-between px-4">
      <SidebarTrigger />
      <span>App Topbar</span>

      {session?.user ? (
        <div className="flex gap-2 items-center">
          <TopbarUploadButton />
          <UserAvatarWithMenu session={session} />
        </div>
      ) : (
        <Button asChild variant={"outline"}>
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div >
  );
}

function UserAvatarWithMenu({ session }: { session: Session; }) {
  const router = useRouter();
  const [ isPending, startTransition ] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (result.success) {
        router.push("/login");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <DropdownMenu>

      {/* 1. The Clickable Profile Trigger */}
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0">
        <Avatar className="h-9 w-9 border border-border cursor-pointer hover:opacity-90 transition-opacity">
          <AvatarImage src="https://github.com" alt="User Profile" />
          <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
            {getUserInitials(session.user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* 2. The Floating Dropdown Menu Container */}
      <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
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

        {/* Log Out */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 py-2 font-medium"
          disabled={isPending}
        >
          <LogOut className="h-4 w-4" />
          <span>{isPending ? "Loggin out" : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
