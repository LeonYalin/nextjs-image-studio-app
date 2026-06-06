"use client";

import { useAlbums } from "@/hooks/use-albums";
import type { AlbumSummary } from "@/app/api/albums/route";
import { Images, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<AlbumSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AlbumSummary | null>(null);

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
    <div className="px-6 pt-3 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13.5px] text-muted-foreground">
          {isLoading ? "" : `${albums?.length ?? 0} ${albums?.length === 1 ? "album" : "albums"}`}
        </span>
        <Button variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New album
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(214px, 1fr))" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-[18px]" />
          ))}
        </div>
      ) : !albums || albums.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(214px, 1fr))" }}>
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
            <AlertDialogTitle className="font-display">Delete &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the album only. The photos inside it are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-[48vh] flex-col items-center justify-center gap-4 text-center">
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "conic-gradient(from 210deg, var(--brand), var(--accent-green), var(--accent-amber), var(--accent-red), var(--brand))",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: "9999px",
            background: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Images className="h-7 w-7 text-muted-foreground stroke-[1.75]" />
        </div>
      </div>
      <div>
        <p className="font-display text-[18px] font-semibold">No albums yet</p>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-xs">
          Create an album to group photos by trip, person, or moment.
        </p>
      </div>
      <Button variant="brand" onClick={onCreate}>
        <Plus className="h-4 w-4" />
        New album
      </Button>
    </div>
  );
}

function AlbumCover({ album }: { album: AlbumSummary }) {
  const photos = (album as AlbumSummary & { photos?: { storageUrl: string }[] }).photos;
  const coverUrl = album.coverUrl;

  if (!coverUrl && (!photos || photos.length === 0)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <Images className="h-8 w-8 stroke-[1.5]" />
      </div>
    );
  }

  if (coverUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={coverUrl} alt={album.title} className="h-full w-full object-cover" />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      <Images className="h-8 w-8 stroke-[1.5]" />
    </div>
  );
}

function AlbumCard({ album, onRename, onDelete }: { album: AlbumSummary; onRename: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/albums/${album.id}`} className="block">
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "1/1",
            borderRadius: 18,
            background: "var(--muted)",
            boxShadow: hover ? "0 8px 24px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.08)",
            transform: hover ? "translateY(-2px)" : "none",
            transition: "box-shadow 0.2s, transform 0.2s",
          }}
        >
          <AlbumCover album={album} />
        </div>
        <div className="mt-2.5 pl-0.5">
          <p className="truncate text-[14.5px] font-semibold">{album.title}</p>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
          </p>
        </div>
      </Link>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Album actions"
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              width: 32,
              height: 32,
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              background: "rgba(20,22,28,.55)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hover ? 1 : 0,
              transition: "opacity 0.15s",
              backdropFilter: "blur(4px)",
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
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
