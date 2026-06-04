"use client";

import { usePhotos } from "@/hooks/use-photos";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import PhotoLightbox from "./PhotoLightbox";
import PhotoThumb from "./PhotoThumb";
import { Skeleton } from "./ui/skeleton";

export default function PhotoGallery() {
  const { photos, isLoading } = usePhotos();
  const [ lightboxOpen, setLightboxOpen ] = useState(false);
  const [ activeIndex, setActiveIndex ] = useState(0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl">
        <ImageOff className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
        <div className="text-center">
          <p className="font-medium text-sm">Your gallery is completely empty</p>
          <p className="text-xs text-muted-foreground mt-1">Use the upload button in the topbar to add your local images.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
        {photos.map((photo, i) => (
          <PhotoThumb
            key={photo.id}
            photo={photo}
            onClick={() => {
              setActiveIndex(i);
              setLightboxOpen(true);
            }}
          />
        ))}
      </div>

      <PhotoLightbox
        photos={photos}
        index={activeIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
