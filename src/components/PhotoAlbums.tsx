"use client";

import { useAlbums } from "@/hooks/use-albums";
import type { AlbumSummary } from "@/app/api/albums/route";
import { FolderOpen, FolderPlus, ImageOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import AlbumFormDialog from "./AlbumFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export default function PhotoAlbums() {
  const { albums, isLoading, createAlbum, isCreating, renameAlbum, isRenaming, deleteAlbum } = useAlbums();
  const [ createOpen, setCreateOpen ] = useState(false);
  const [ renameTarget, setRenameTarget ] = useState<AlbumSummary | null>(null);
  const [ deleteTarget, setDeleteTarget ] = useState<AlbumSummary | null>(null);

  const handleCreate = async (title: string) => {
    try {
      await createAlbum(title);
      toast.success("Album created");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create album");
    }
  };

  const handleRename = async (title: string) => {
    if (!renameTarget) return;
    try {
      await renameAlbum({ id: renameTarget.id, title });
      toast.success("Album renamed");
      setRenameTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename album");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAlbum(deleteTarget.id);
      toast.success("Album deleted");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete album");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Albums</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <FolderPlus className="h-4 w-4" />
          New album
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : !albums || albums.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
          <FolderOpen className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
          <div className="text-center">
            <p className="text-sm font-medium">No albums yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create an album to start organizing your photos.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onRename={() => setRenameTarget(album)}
              onDelete={() => setDeleteTarget(album)}
            />
          ))}
        </div>
      )}

      <AlbumFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        heading="New album"
        description="Give your album a name. You can add photos from the photo viewer."
        submitLabel="Create"
        pending={isCreating}
        onSubmit={handleCreate}
      />

      <AlbumFormDialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        heading="Rename album"
        submitLabel="Save"
        defaultTitle={renameTarget?.title ?? ""}
        pending={isRenaming}
        onSubmit={handleRename}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the album only. The photos inside it are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AlbumCard({
  album,
  onRename,
  onDelete,
}: {
  album: AlbumSummary;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [ coverError, setCoverError ] = useState(false);

  return (
    <div className="group relative">
      <Link href={`/albums/${album.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-black shadow-sm">
          {album.coverUrl && !coverError ? (
            <Image
              src={album.coverUrl}
              alt={album.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform group-hover:scale-[1.03]"
              onError={() => setCoverError(true)}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              {album.coverUrl ? <ImageOff className="h-8 w-8 stroke-[1.5]" /> : <FolderOpen className="h-8 w-8 stroke-[1.5]" />}
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="truncate text-sm font-medium">{album.title}</p>
          <p className="text-xs text-muted-foreground">
            {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Album actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRename} className="gap-2">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
