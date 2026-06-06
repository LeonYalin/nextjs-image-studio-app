"use client";

import { logoutAction } from "@/lib/actions";
import { LogOut, User } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import ProfileDialog from "./ProfileDialog";
import TopbarUploadButton from "./TopbarUploadButton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ["var(--brand)", "var(--accent-red)", "var(--accent-amber)", "var(--accent-green)"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h * 31 + name.charCodeAt(i)) >>> 0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

const PAGE_TITLES: Record<string, string> = {
  "/photos": "Photos",
  "/albums": "Albums",
};

export default function AppTopbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? (pathname.startsWith("/albums/") ? "Album" : "");

  return (
    <header
      className="flex h-16 items-center justify-between gap-3 border-b px-5 shrink-0"
      style={{
        background: "color-mix(in oklch, var(--background) 88%, transparent)",
        backdropFilter: "saturate(1.1) blur(8px)",
        position: "relative",
        zIndex: 30,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {title && (
          <h1 className="font-display text-[20px] font-semibold tracking-[-0.015em] m-0 leading-none">
            {title}
          </h1>
        )}
      </div>

      {session?.user ? (
        <div className="flex items-center gap-2.5">
          <TopbarUploadButton />
          <UserAvatarWithMenu session={session} />
        </div>
      ) : (
        <Button asChild variant="brand">
          <Link href="/login">Sign in</Link>
        </Button>
      )}
    </header>
  );
}

function UserAvatarWithMenu({ session }: { session: Session }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [profileOpen, setProfileOpen] = useState(false);

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

  const name = session.user.name ?? "User";
  const bg = avatarColor(name);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0">
          <Avatar className="h-[38px] w-[38px] cursor-pointer hover:opacity-90 transition-opacity">
            <AvatarImage src={session.user.avatarUrl || undefined} alt={name} />
            <AvatarFallback style={{ background: bg }} className="text-white text-xs font-semibold">
              {getUserInitials(name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2.5 py-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session.user.avatarUrl || undefined} alt={name} />
                <AvatarFallback style={{ background: bg }} className="text-white text-xs font-semibold">
                  {getUserInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer gap-2 py-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 py-2 font-medium"
            disabled={isPending}
          >
            <LogOut className="h-4 w-4" />
            {isPending ? "Logging out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
