import type { AlbumSummary } from "@/app/api/albums/route";
import type { AlbumDetail } from "@/app/api/albums/[id]/route";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function jsonOrThrow(res: Response, fallback: string) {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || fallback);
  }
  return res.json();
}

export function useAlbums() {
  const queryClient = useQueryClient();

  const { data: albums, isLoading, error } = useQuery<AlbumSummary[]>({
    queryKey: [ "albums" ],
    queryFn: async () => jsonOrThrow(await fetch("/api/albums"), "Failed to load albums"),
  });

  const createAlbum = useMutation<{ id: string }, Error, string>({
    mutationFn: async (title: string) =>
      jsonOrThrow(
        await fetch("/api/albums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }),
        "Failed to create album"
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ "albums" ] }),
  });

  const renameAlbum = useMutation<void, Error, { id: string; title: string }>({
    mutationFn: async ({ id, title }) => {
      await jsonOrThrow(
        await fetch(`/api/albums/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }),
        "Failed to rename album"
      );
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: [ "albums" ] });
      queryClient.invalidateQueries({ queryKey: [ "album", id ] });
    },
  });

  const deleteAlbum = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await jsonOrThrow(await fetch(`/api/albums/${id}`, { method: "DELETE" }), "Failed to delete album");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ "albums" ] }),
  });

  const addPhotoToAlbum = useMutation<void, Error, { albumId: string; photoId: string }>({
    mutationFn: async ({ albumId, photoId }) => {
      await jsonOrThrow(
        await fetch(`/api/albums/${albumId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId }),
        }),
        "Failed to add photo to album"
      );
    },
    onSuccess: (_data, { albumId }) => {
      queryClient.invalidateQueries({ queryKey: [ "albums" ] });
      queryClient.invalidateQueries({ queryKey: [ "album", albumId ] });
    },
  });

  return {
    albums,
    isLoading,
    error,
    createAlbum: createAlbum.mutateAsync,
    isCreating: createAlbum.isPending,
    renameAlbum: renameAlbum.mutateAsync,
    isRenaming: renameAlbum.isPending,
    deleteAlbum: deleteAlbum.mutateAsync,
    isDeleting: deleteAlbum.isPending,
    addPhotoToAlbum: addPhotoToAlbum.mutateAsync,
    isAddingPhoto: addPhotoToAlbum.isPending,
  };
}

export function useAlbum(id: string) {
  const queryClient = useQueryClient();

  const { data: album, isLoading, error } = useQuery<AlbumDetail>({
    queryKey: [ "album", id ],
    queryFn: async () => jsonOrThrow(await fetch(`/api/albums/${id}`), "Failed to load album"),
    enabled: Boolean(id),
  });

  const removePhotoFromAlbum = useMutation<void, Error, string>({
    mutationFn: async (photoId: string) => {
      await jsonOrThrow(
        await fetch(`/api/albums/${id}/photos`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId }),
        }),
        "Failed to remove photo from album"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ "album", id ] });
      queryClient.invalidateQueries({ queryKey: [ "albums" ] });
    },
  });

  return {
    album,
    isLoading,
    error,
    removePhotoFromAlbum: removePhotoFromAlbum.mutateAsync,
    isRemovingPhoto: removePhotoFromAlbum.isPending,
  };
}
