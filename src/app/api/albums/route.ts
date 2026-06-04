import { auth } from "@/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export type AlbumSummary = {
  id: string;
  title: string;
  createdAt: number | null;
  photoCount: number;
  coverUrl: string | null;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const userAlbums = await db
      .select()
      .from(schema.albums)
      .where(eq(schema.albums.userId, session.user.id))
      .orderBy(desc(schema.albums.createdAt));

    if (userAlbums.length === 0) {
      return NextResponse.json([] as AlbumSummary[]);
    }

    // single extra round-trip (not N+1): pull every photo in these albums,
    // newest first, then derive cover + count per album in JS.
    const albumIds = userAlbums.map((a) => a.id);
    const rows = await db
      .select({
        albumId: schema.albumPhotos.albumId,
        storageUrl: schema.photos.storageUrl,
        createdAt: schema.photos.createdAt,
      })
      .from(schema.albumPhotos)
      .innerJoin(schema.photos, eq(schema.albumPhotos.photoId, schema.photos.id))
      .where(inArray(schema.albumPhotos.albumId, albumIds))
      .orderBy(desc(schema.photos.createdAt));

    const countByAlbum = new Map<string, number>();
    const coverByAlbum = new Map<string, string>();
    for (const row of rows) {
      countByAlbum.set(row.albumId, (countByAlbum.get(row.albumId) ?? 0) + 1);
      if (!coverByAlbum.has(row.albumId)) {
        coverByAlbum.set(row.albumId, row.storageUrl);
      }
    }

    const result: AlbumSummary[] = userAlbums.map((a) => ({
      id: a.id,
      title: a.title,
      createdAt: a.createdAt ? a.createdAt.getTime() : null,
      photoCount: countByAlbum.get(a.id) ?? 0,
      coverUrl: coverByAlbum.get(a.id) ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting albums", error);
    return NextResponse.json({ error: "Error getting albums" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const createAlbumSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  });

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createAlbumSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[ 0 ]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    await db.insert(schema.albums).values({
      id,
      userId: session.user.id,
      title: parsed.data.title,
    });

    return NextResponse.json({ id, title: parsed.data.title });
  } catch (error) {
    console.error("Error creating album", error);
    return NextResponse.json({ error: "Error creating album" }, { status: 500 });
  }
}
