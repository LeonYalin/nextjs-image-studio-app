import { auth } from "@/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { Photo } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export type AlbumDetail = {
  id: string;
  title: string;
  photos: Photo[];
};

async function getOwnedAlbum(albumId: string, userId: string) {
  return db
    .select()
    .from(schema.albums)
    .where(and(eq(schema.albums.id, albumId), eq(schema.albums.userId, userId)))
    .get();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const { id } = await params;
    const album = await getOwnedAlbum(id, session.user.id);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const photos = await db
      .select({
        id: schema.photos.id,
        userId: schema.photos.userId,
        storageUrl: schema.photos.storageUrl,
        createdAt: schema.photos.createdAt,
      })
      .from(schema.albumPhotos)
      .innerJoin(schema.photos, eq(schema.albumPhotos.photoId, schema.photos.id))
      .where(eq(schema.albumPhotos.albumId, id))
      .orderBy(desc(schema.photos.createdAt));

    const result: AlbumDetail = { id: album.id, title: album.title, photos };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting album", error);
    return NextResponse.json({ error: "Error getting album" }, { status: 500 });
  }
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  const renameSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  });

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const { id } = await params;
    const album = await getOwnedAlbum(id, session.user.id);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = renameSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[ 0 ]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    await db
      .update(schema.albums)
      .set({ title: parsed.data.title })
      .where(eq(schema.albums.id, id));

    return NextResponse.json({ id, title: parsed.data.title });
  } catch (error) {
    console.error("Error renaming album", error);
    return NextResponse.json({ error: "Error renaming album" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const { id } = await params;
    const album = await getOwnedAlbum(id, session.user.id);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // album_photos rows cascade away; photos themselves are untouched
    await db.delete(schema.albums).where(eq(schema.albums.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting album", error);
    return NextResponse.json({ error: "Error deleting album" }, { status: 500 });
  }
}
