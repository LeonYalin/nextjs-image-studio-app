"use client";

import { useAlbum } from "@/hooks/use-albums";
import { ArrowLeft, ImageOff, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import JustifiedGallery from "./JustifiedGallery";
import PhotoLightbox from "./PhotoLightbox";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function AlbumDetail({ albumId }: { albumId: string }) {
  const { album, isLoading, error, removePhotoFromAlbum, isRemovingPhoto } = useAlbum(albumId);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleRemove = async (photoId: string) => {
    try {
      await removePhotoFromAlbum(photoId);
      toast.success("Removed from album");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove photo");
    }
  };

  return (
    <div className="px-6 pt-1 pb-10">
      <div className="flex items-center gap-3.5 my-2 mb-5">
        <Button asChild variant="ghost" size="icon">
          <Link href="/albums" aria-label="Back to albums">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.02em] leading-tight m-0">
            {isLoading ? "Loading…" : album?.title ?? "Album"}
          </h1>
          {!isLoading && album && (
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {album.photos.length} {album.photos.length === 1 ? "photo" : "photos"}
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="h-10 w-10 stroke-[1.5]" />
          <p className="text-sm">This album could not be loaded.</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-64 rounded-[10px]" />
          ))}
        </div>
      ) : !album || album.photos.length === 0 ? (
        <div className="flex h-[44vh] flex-col items-center justify-center gap-3 text-center">
          <ImageOff className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
          <div>
            <p className="text-sm font-medium">This album is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open a photo from your gallery and use &ldquo;Add to album&rdquo;.
            </p>
          </div>
        </div>
      ) : (
        <>
          <JustifiedGallery
            photos={album.photos}
            onOpen={(i) => { setActiveIndex(i); setLightboxOpen(true); }}
            targetH={220}
            renderOverlay={(p) => (
              <button
                onClick={() => handleRemove(p.id)}
                disabled={isRemovingPhoto}
                aria-label="Remove from album"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "9999px",
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(20,22,28,.6)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          />

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
