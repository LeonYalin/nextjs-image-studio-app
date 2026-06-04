import { auth } from "@/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const bodySchema = z.object({ photoId: z.string().min(1) });

async function authorize(albumId: string, photoId: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Auth error" }, { status: 401 }) };
  }

  const parsed = bodySchema.safeParse({ photoId });
  if (!parsed.success) {
    return { error: NextResponse.json({ error: "photoId is required" }, { status: 400 }) };
  }

  // both the album and the photo must belong to the session user
  const album = await db
    .select({ id: schema.albums.id })
    .from(schema.albums)
    .where(and(eq(schema.albums.id, albumId), eq(schema.albums.userId, session.user.id)))
    .get();
  if (!album) {
    return { error: NextResponse.json({ error: "Album not found" }, { status: 404 }) };
  }

  const photo = await db
    .select({ id: schema.photos.id })
    .from(schema.photos)
    .where(and(eq(schema.photos.id, parsed.data.photoId), eq(schema.photos.userId, session.user.id)))
    .get();
  if (!photo) {
    return { error: NextResponse.json({ error: "Photo not found" }, { status: 404 }) };
  }

  return { photoId: parsed.data.photoId };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const result = await authorize(id, body.photoId);
    if (result.error) return result.error;

    await db
      .insert(schema.albumPhotos)
      .values({ albumId: id, photoId: result.photoId })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding photo to album", error);
    return NextResponse.json({ error: "Error adding photo to album" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const result = await authorize(id, body.photoId);
    if (result.error) return result.error;

    await db
      .delete(schema.albumPhotos)
      .where(
        and(
          eq(schema.albumPhotos.albumId, id),
          eq(schema.albumPhotos.photoId, result.photoId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing photo from album", error);
    return NextResponse.json({ error: "Error removing photo from album" }, { status: 500 });
  }
}
