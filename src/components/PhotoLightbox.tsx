"use client";

import { useAlbums } from "@/hooks/use-albums";
import { usePhotos } from "@/hooks/use-photos";
import { Photo } from "@/db/schema";
import { ChevronLeft, ChevronRight, ImageOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type PhotoLightboxProps = {
  photos: Photo[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
};

export default function PhotoLightbox({
  photos,
  index,
  open,
  onOpenChange,
  onIndexChange,
}: PhotoLightboxProps) {
  const { deletePhoto, isDeleting } = usePhotos();
  const { albums, addPhotoToAlbum, isAddingPhoto } = useAlbums();
  const [ hasError, setHasError ] = useState(false);

  const total = photos.length;
  const photo = photos[ index ];

  const goPrev = useCallback(() => {
    if (total > 0) onIndexChange((index - 1 + total) % total);
  }, [ index, total, onIndexChange ]);

  const goNext = useCallback(() => {
    if (total > 0) onIndexChange((index + 1) % total);
  }, [ index, total, onIndexChange ]);

  // reset the broken-image state whenever the visible photo changes
  useEffect(() => {
    setHasError(false);
  }, [ photo?.id ]);

  // arrow-key navigation while open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ open, goPrev, goNext ]);

  if (!photo) return null;

  const handleDelete = async () => {
    try {
      await deletePhoto(photo.id);
      toast.success("Photo deleted");
      if (total <= 1) {
        onOpenChange(false);
      } else if (index >= total - 1) {
        onIndexChange(total - 2);
      }
      // otherwise the same index now points at the next photo
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete photo");
    }
  };

  const handleAddToAlbum = async (albumId: string) => {
    try {
      await addPhotoToAlbum({ albumId, photoId: photo.id });
      const album = albums?.find((a) => a.id === albumId);
      toast.success(`Added to ${album?.title ?? "album"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add to album");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Photo viewer</DialogTitle>

        <div className="relative flex h-[70vh] items-center justify-center bg-black">
          {hasError ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="h-12 w-12 stroke-[1.5]" />
              <span className="text-sm">This image is unavailable</span>
            </div>
          ) : (
            <Image
              key={photo.id}
              src={photo.storageUrl}
              alt="User photo"
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-contain"
              onError={() => setHasError(true)}
              unoptimized
            />
          )}

          {total > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-background px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {index + 1} / {total}
          </span>

          <div className="flex items-center gap-2">
            {albums && albums.length > 0 && (
              <Select onValueChange={handleAddToAlbum} disabled={isAddingPhoto}>
                <SelectTrigger size="sm" className="w-44">
                  <SelectValue placeholder="Add to album…" />
                </SelectTrigger>
                <SelectContent>
                  {albums.map((album) => (
                    <SelectItem key={album.id} value={album.id}>
                      {album.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the photo and its file. This cannot be undone.
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
