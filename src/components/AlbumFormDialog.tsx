"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
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

const albumSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

type AlbumFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: string;
  description?: string;
  submitLabel: string;
  defaultTitle?: string;
  pending?: boolean;
  onSubmit: (title: string) => Promise<void> | void;
};

export default function AlbumFormDialog({
  open,
  onOpenChange,
  heading,
  description,
  submitLabel,
  defaultTitle = "",
  pending = false,
  onSubmit,
}: AlbumFormDialogProps) {
  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: { title: defaultTitle },
  });

  // sync the field when reopening for a different album / fresh create
  useEffect(() => {
    if (open) form.reset({ title: defaultTitle });
  }, [ open, defaultTitle, form ]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values.title);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="album-title">Title</Label>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="album-title"
                    placeholder="e.g. Summer trip"
                    autoFocus
                    disabled={pending}
                    {...field}
                  />
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="brand" type="submit" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
