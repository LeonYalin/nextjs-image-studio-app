"use client";

import { useAlbum } from "@/hooks/use-albums";
import { ArrowLeft, ImageOff, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import PhotoLightbox from "./PhotoLightbox";
import PhotoThumb from "./PhotoThumb";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function AlbumDetail({ albumId }: { albumId: string }) {
  const { album, isLoading, error, removePhotoFromAlbum, isRemovingPhoto } = useAlbum(albumId);
  const [ lightboxOpen, setLightboxOpen ] = useState(false);
  const [ activeIndex, setActiveIndex ] = useState(0);

  const handleRemove = async (photoId: string) => {
    try {
      await removePhotoFromAlbum(photoId);
      toast.success("Removed from album");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove photo");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/albums" aria-label="Back to albums">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">
          {isLoading ? "Loading…" : album?.title ?? "Album"}
        </h1>
      </div>

      {error ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="h-10 w-10 stroke-[1.5]" />
          <p className="text-sm">This album could not be loaded.</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : !album || album.photos.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
          <ImageOff className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
          <div className="text-center">
            <p className="text-sm font-medium">This album is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open a photo from your gallery and use &ldquo;Add to album&rdquo;.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {album.photos.map((photo, i) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                onClick={() => {
                  setActiveIndex(i);
                  setLightboxOpen(true);
                }}
                overlay={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    disabled={isRemovingPhoto}
                    onClick={() => handleRemove(photo.id)}
                    aria-label="Remove from album"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                }
              />
            ))}
          </div>

          <PhotoLightbox
            photos={album.photos}
            index={activeIndex}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            onIndexChange={setActiveIndex}
          />
        </>
      )}
    </div>
  );
}
