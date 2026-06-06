"use client";

import { usePhotos } from "@/hooks/use-photos";
import { Loader2, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function TopbarUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading } = usePhotos();

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhoto(file, {
      onSuccess: () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("Photo uploaded");
      },
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
      <Button variant="brand" onClick={handleTriggerClick} disabled={isUploading}>
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading ? "Uploading…" : "Upload"}
      </Button>
    </>
  );
}
