"use client";

import { usePhotos } from "@/hooks/use-photos";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import JustifiedGallery from "./JustifiedGallery";
import PhotoLightbox from "./PhotoLightbox";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function PhotoGallery() {
  const { photos, isLoading } = usePhotos();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-1.5 p-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-64 rounded-[10px]" />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="px-6 pt-3 pb-10">
        <JustifiedGallery
          photos={photos}
          onOpen={(i) => { setActiveIndex(i); setLightboxOpen(true); }}
        />
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

function EmptyState() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading } = usePhotos();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhoto(file, {
      onSuccess: () => { if (fileInputRef.current) fileInputRef.current.value = ""; },
    });
  };

  return (
    <div className="flex h-[62vh] flex-col items-center justify-center gap-4 text-center px-6">
      <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleFileSelection} />
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
          <ImageOff className="h-7 w-7 text-muted-foreground stroke-[1.75]" />
        </div>
      </div>
      <div>
        <p className="font-display text-[18px] font-semibold">Your gallery is empty</p>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground max-w-xs">
          Upload your photos and they'll appear here, organized and easy to revisit.
        </p>
      </div>
      <Button variant="brand" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isUploading ? "Uploading…" : "Upload photos"}
      </Button>
    </div>
  );
}
