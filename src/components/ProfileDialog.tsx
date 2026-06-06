"use client";

import { updateProfileAction } from "@/lib/actions";
import { usePhotos } from "@/hooks/use-photos";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(80, "Name is too long"),
  avatarUrl: z.union([ z.url("Enter a valid image URL"), z.literal("") ]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[ 0 ].slice(0, 2).toUpperCase();
  return (parts[ 0 ][ 0 ] + parts[ parts.length - 1 ][ 0 ]).toUpperCase();
}

export default function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session, update } = useSession();
  const { photos } = usePhotos();
  const router = useRouter();
  const [ isPending, startTransition ] = useTransition();
  const [ serverError, setServerError ] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", avatarUrl: "" },
  });

  // hydrate the form from the session whenever the dialog opens
  useEffect(() => {
    if (open && session?.user) {
      form.reset({
        name: session.user.name ?? "",
        avatarUrl: session.user.avatarUrl ?? "",
      });
      setServerError(null);
    }
  }, [ open, session?.user, form ]);

  const watchedName = form.watch("name");
  const watchedAvatar = form.watch("avatarUrl");

  const onSubmit = (values: ProfileFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.success) {
        await update({ user: { name: result.name, avatarUrl: result.avatarUrl } });
        router.refresh();
        toast.success("Profile updated");
        onOpenChange(false);
      } else {
        setServerError(result.error);
      }
    });
  };

  if (!session?.user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Update your display name and avatar.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={watchedAvatar || undefined} alt="Avatar preview" />
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {initials(watchedName || session.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session.user.email}</p>
            <p className="text-xs text-muted-foreground">
              {photos?.length ?? 0} {photos?.length === 1 ? "photo" : "photos"}
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <>
                  <Input id="profile-name" disabled={isPending} {...field} />
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-avatar">Avatar URL</Label>
            <Controller
              control={form.control}
              name="avatarUrl"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="profile-avatar"
                    placeholder="https://example.com/avatar.jpg"
                    disabled={isPending}
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          <DialogFooter>
            <Button variant="brand" type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
