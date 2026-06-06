"use client";

import { useLayoutEffect, useRef, useState } from "react";

export type GalleryPhoto = {
  id: string;
  storageUrl: string;
  ar?: number; // aspect ratio width/height (filled once image loads)
};

type Row = { photos: GalleryPhoto[]; h: number; last?: boolean };

function computeRows(photos: GalleryPhoto[], containerW: number, targetH: number, gap: number): Row[] {
  const rows: Row[] = [];
  let row: GalleryPhoto[] = [];
  let rowAr = 0;

  for (const p of photos) {
    const ar = p.ar ?? 4 / 3;
    row.push(p);
    rowAr += ar;
    const rowW = rowAr * targetH + (row.length - 1) * gap;
    if (rowW >= containerW) {
      const h = (containerW - (row.length - 1) * gap) / rowAr;
      rows.push({ photos: row, h });
      row = [];
      rowAr = 0;
    }
  }
  if (row.length) rows.push({ photos: row, h: targetH, last: true });
  return rows;
}

type Props = {
  photos: GalleryPhoto[];
  onOpen: (index: number) => void;
  targetH?: number;
  gap?: number;
  renderOverlay?: (photo: GalleryPhoto) => React.ReactNode;
};

export default function JustifiedGallery({ photos, onOpen, targetH = 240, gap = 6, renderOverlay }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [ars, setArs] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => setContainerW(entries[0].contentRect.width));
    ro.observe(containerRef.current);
    setContainerW(containerRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const withAr: GalleryPhoto[] = photos.map((p) => ({ ...p, ar: ars[p.id] ?? 4 / 3 }));
  const rows = containerW > 0 ? computeRows(withAr, containerW, targetH, gap) : [];

  const handleLoad = (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth) return;
    const ar = img.naturalWidth / img.naturalHeight;
    setArs((prev) => (prev[id] === ar ? prev : { ...prev, [id]: ar }));
  };

  return (
    <div ref={containerRef} className="flex flex-col" style={{ gap }}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex" style={{ gap, justifyContent: "flex-start" }}>
          {row.photos.map((p) => {
            const globalIdx = photos.findIndex((ph) => ph.id === p.id);
            const w = row.h * (p.ar ?? 4 / 3);
            return (
              <GalleryTile
                key={p.id}
                photo={p}
                w={w}
                h={row.h}
                onClick={() => onOpen(globalIdx)}
                onLoad={(e) => handleLoad(p.id, e)}
                overlay={renderOverlay?.(p)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

type TileProps = {
  photo: GalleryPhoto;
  w: number;
  h: number;
  onClick: () => void;
  onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  overlay?: React.ReactNode;
};

function GalleryTile({ photo, w, h, onClick, onLoad, overlay }: TileProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        position: "relative",
        width: w,
        height: h,
        flexShrink: 0,
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--muted)",
        cursor: "pointer",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.storageUrl}
        alt=""
        loading="lazy"
        onLoad={onLoad}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), filter 0.2s",
          transform: hover ? "scale(1.045)" : "none",
          filter: hover ? "brightness(0.93)" : "none",
        }}
      />
      {hover && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.28), rgba(0,0,0,0) 38%)",
            pointerEvents: "none",
          }}
        />
      )}
      {overlay && (
        <div
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            opacity: hover ? 1 : 0,
            transition: "opacity 0.15s",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
