import { Photo } from "@/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePhotos() {
  const queryClient = useQueryClient();

  const { data: photos, isLoading, error } = useQuery<Photo[]>({
    queryKey: [ "photos" ],
    queryFn: async () => {
      return await fetch("/api/photos")
        .then(res => res.json())
        .catch(e => { throw new Error(e); });
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

  return {
    photos,
    isLoading,
    error,
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploading: uploadPhotoMutation.isPending,
  };
}
