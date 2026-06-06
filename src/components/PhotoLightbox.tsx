"use client";

import { useAlbums, usePhotoAlbums } from "@/hooks/use-albums";
import { usePhotos } from "@/hooks/use-photos";
import { Photo } from "@/db/schema";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, FolderPlus, ImageOff, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  photos: Photo[];
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
};

export default function PhotoLightbox({ photos, index, open, onOpenChange, onIndexChange }: Props) {
  const { deletePhoto, isDeleting } = usePhotos();
  const { albums, addPhotoToAlbum } = useAlbums();
  const [hasError, setHasError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [albumMenuOpen, setAlbumMenuOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const total = photos.length;
  const photo = photos[index];

  const { albumIds: photoAlbumIds } = usePhotoAlbums(open ? photo?.id : undefined);

  const goPrev = useCallback(() => { if (total > 0) onIndexChange((index - 1 + total) % total); }, [index, total, onIndexChange]);
  const goNext = useCallback(() => { if (total > 0) onIndexChange((index + 1) % total); }, [index, total, onIndexChange]);

  useEffect(() => { setHasError(false); }, [photo?.id]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (confirmDelete) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, confirmDelete, goPrev, goNext, onOpenChange]);

  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`);
    if (el) el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [index]);

  if (!open || !photo) return null;

  const handleDelete = async () => {
    try {
      await deletePhoto(photo.id);
      setConfirmDelete(false);
      toast.success("Photo deleted");
      if (total <= 1) {
        onOpenChange(false);
      } else if (index >= total - 1) {
        onIndexChange(total - 2);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete photo");
    }
  };

  const handleAddToAlbum = async (albumId: string) => {
    if (photoAlbumIds.includes(albumId)) return;
    setAlbumMenuOpen(false);
    try {
      await addPhotoToAlbum({ albumId, photoId: photo.id });
      const album = albums?.find((a) => a.id === albumId);
      toast.success(`Added to ${album?.title ?? "album"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add to album");
    }
  };

  return (
    <div
      className="ink-surface fixed inset-0 z-60 flex flex-col"
      style={{ fontFamily: "var(--font-sans)", animation: "ig-fade 0.18s cubic-bezier(0.22,1,0.36,1)" }}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3.5"
        style={{
          height: 60,
          background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,0))",
        }}
      >
        <div className="flex items-center gap-2.5">
          <InkBtn icon={<ArrowLeft size={20} />} label="Close" onClick={() => onOpenChange(false)} />
          <span className="on-ink-muted text-[13px]">{index + 1} of {total}</span>
        </div>
        <div className="flex items-center gap-1.5 relative">
          {albums && albums.length > 0 && (
            <div className="relative">
              <InkBtn icon={<FolderPlus size={20} />} label="Add to album" onClick={() => setAlbumMenuOpen((v) => !v)} />
              {albumMenuOpen && (
                <>
                  <div onClick={() => setAlbumMenuOpen(false)} className="fixed inset-0 z-10" />
                  <div
                    className="absolute right-0 top-12 z-20 min-w-[200px] rounded-xl p-1.5"
                    style={{
                      background: "var(--ink-2)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div className="px-2.5 py-1 text-[11.5px] on-ink-muted uppercase tracking-widest">Add to album</div>
                    {albums.map((a) => {
                      const alreadyIn = photoAlbumIds.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => handleAddToAlbum(a.id)}
                          disabled={alreadyIn}
                          className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-[--on-ink] transition-colors border-none cursor-pointer disabled:cursor-default"
                          style={{
                            background: "transparent",
                            fontFamily: "var(--font-sans)",
                            opacity: alreadyIn ? 0.55 : 1,
                          }}
                          onMouseEnter={(e) => { if (!alreadyIn) (e.currentTarget as HTMLElement).style.background = "var(--ink-3)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <span>{a.title}</span>
                          {alreadyIn && <Check size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          <InkBtn icon={<Trash2 size={20} />} label="Delete" onClick={() => setConfirmDelete(true)} danger />
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex flex-1 items-center justify-center min-h-0">
        {hasError ? (
          <div className="flex flex-col items-center gap-2 on-ink-muted">
            <ImageOff className="h-12 w-12 stroke-[1.5]" />
            <span className="text-sm">This image is unavailable</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={photo.id}
            src={photo.storageUrl}
            alt=""
            onError={() => setHasError(true)}
            style={{
              maxWidth: "92%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 4,
              animation: "ig-pop 0.22s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        )}

        {total > 1 && (
          <>
            <InkNav side="left" onClick={goPrev} />
            <InkNav side="right" onClick={goNext} />
          </>
        )}
      </div>

      {/* Filmstrip */}
      {total > 1 && (
        <div
          ref={stripRef}
          className="ink-bar flex items-center gap-1.5 px-4"
          style={{
            height: 84,
            overflowX: "auto",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            scrollbarWidth: "none",
          }}
        >
          {photos.map((p, i) => (
            <button
              key={p.id}
              data-i={i}
              onClick={() => onIndexChange(i)}
              style={{
                flexShrink: 0,
                width: i === index ? 64 : 56,
                height: i === index ? 64 : 56,
                borderRadius: 8,
                overflow: "hidden",
                border: i === index ? "2.5px solid var(--brand)" : "2.5px solid transparent",
                padding: 0,
                cursor: "pointer",
                background: "var(--ink-3)",
                transition: "all 0.18s cubic-bezier(0.22,1,0.36,1)",
                opacity: i === index ? 1 : 0.62,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.storageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      {/* Inline delete confirmation — avoids z-index conflict with the fixed lightbox */}
      {confirmDelete && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: "rgba(12,13,15,0.82)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(false); }}
        >
          <div
            className="rounded-2xl p-6 mx-4 w-full max-w-xs"
            style={{
              background: "var(--ink-2)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <h3 className="font-display text-[17px] font-semibold m-0" style={{ color: "var(--on-ink)" }}>
              Delete this photo?
            </h3>
            <p className="text-[13.5px] mt-2 mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,.58)" }}>
              This permanently removes the photo and its file. This cannot be undone.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-full px-4 h-9 text-[13.5px] font-medium border-none cursor-pointer transition-colors"
                style={{ background: "rgba(255,255,255,.08)", color: "var(--on-ink)", fontFamily: "var(--font-sans)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.14)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.08)"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full px-4 h-9 text-[13.5px] font-medium text-white border-none cursor-pointer transition-opacity disabled:opacity-50"
                style={{ background: "var(--accent-red)", fontFamily: "var(--font-sans)" }}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InkBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 40,
        height: 40,
        borderRadius: "9999px",
        border: "none",
        cursor: "pointer",
        background: hover ? (danger ? "rgba(229,72,77,.22)" : "rgba(255,255,255,.16)") : "transparent",
        color: danger && hover ? "#ff9a9d" : "var(--on-ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

function InkNav({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [side]: 18,
        width: 48,
        height: 48,
        borderRadius: "9999px",
        border: "none",
        cursor: "pointer",
        background: hover ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.08)",
        color: "var(--on-ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
        backdropFilter: "blur(2px)",
      }}
    >
      {side === "left" ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );
}
