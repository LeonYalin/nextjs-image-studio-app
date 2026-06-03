"use client";

import { usePhotos } from "@/hooks/use-photos";
import { Loader2, UploadCloud } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";

export default function TopbarUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading } = usePhotos();

  const handleTrigerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFiles = e.target.files;
    if (!targetFiles || !targetFiles.length) return;

    uploadPhoto(targetFiles[ 0 ], {
      onSuccess: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };
  return (
    <>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={fileInputRef}
        disabled={isUploading}
        onChange={handleFileSelection}
      />
      <Button variant="secondary" size="default" onClick={handleTrigerClick}>
        <span>
          {
            isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex items-center gap-2">
                Upload Photo <UploadCloud className="h-5 w-5" />
              </div>
            )
          }
        </span>
      </Button>
    </>
  );
}
