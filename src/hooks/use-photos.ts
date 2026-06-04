import { Photo } from "@/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePhotos() {
  const queryClient = useQueryClient();

  const { data: photos, isLoading, error } = useQuery<Photo[]>({
    queryKey: [ "photos" ],
    queryFn: async () => {
      const res = await fetch("/api/photos");
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to load photos");
      }
      return res.json();
    }
  });

  const uploadPhotoMutation = useMutation<Photo, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        const payload = await result.json();
        throw new Error(payload.error || "Upload failed");
      }

      return result.json();
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ "photos" ] });
    },
  });

  const deletePhotoMutation = useMutation<void, Error, string>({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Delete failed");
      }
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [ "photos" ] });
      // a deleted photo may have belonged to albums — refresh their covers/counts
      queryClient.invalidateQueries({ queryKey: [ "albums" ] });
    },
  });

  return {
    photos,
    isLoading,
    error,
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploading: uploadPhotoMutation.isPending,
    deletePhoto: deletePhotoMutation.mutateAsync,
    isDeleting: deletePhotoMutation.isPending,
  };
}
