"use client";

import { usePhotos } from "@/hooks/use-photos";
import { Skeleton } from "./ui/skeleton";
import { ImageOff } from "lucide-react";
import Image from "next/image";

export default function PhotoGallery() {
  const { photos, isLoading } = usePhotos();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
        {Array.from({ length: 12 }).map((el, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (photos?.length === 0) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
      {photos?.map((photo) => (
        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-secondary/30 shadow-sm">
          <Image
            src={photo.storageUrl}
            fill
            alt="User photo"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            unoptimized // Highly recommended for speed when retrieving from your local public filesystem
          />
        </div>
      ))}
    </div>
  );
}
