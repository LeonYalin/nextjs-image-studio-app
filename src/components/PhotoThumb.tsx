"use client";

import { Photo } from "@/db/schema";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type PhotoThumbProps = {
  photo: Photo;
  onClick?: () => void;
  /** Optional control (e.g. remove-from-album) rendered on hover, top-right. */
  overlay?: React.ReactNode;
};

export default function PhotoThumb({ photo, onClick, overlay }: PhotoThumbProps) {
  const [ hasError, setHasError ] = useState(false);

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-black shadow-sm">
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
          <ImageOff className="h-8 w-8 stroke-[1.5]" />
          <span className="text-[10px]">Unavailable</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open photo"
        >
          <Image
            src={photo.storageUrl}
            fill
            alt="User photo"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-contain transition-transform group-hover:scale-[1.02]"
            onError={() => setHasError(true)}
            unoptimized // local public filesystem — skip the optimizer
          />
        </button>
      )}
      {overlay && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          {overlay}
        </div>
      )}
    </div>
  );
}
