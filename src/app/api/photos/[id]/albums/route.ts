import { auth } from "@/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Auth error" }, { status: 401 });

    const { id: photoId } = await params;

    const photo = await db
      .select({ id: schema.photos.id })
      .from(schema.photos)
      .where(and(eq(schema.photos.id, photoId), eq(schema.photos.userId, session.user.id)))
      .get();
    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rows = await db
      .select({ albumId: schema.albumPhotos.albumId })
      .from(schema.albumPhotos)
      .innerJoin(schema.albums, eq(schema.albumPhotos.albumId, schema.albums.id))
      .where(
        and(
          eq(schema.albumPhotos.photoId, photoId),
          eq(schema.albums.userId, session.user.id)
        )
      );

    return NextResponse.json({ albumIds: rows.map((r) => r.albumId) });
  } catch (error) {
    console.error("Error fetching photo albums", error);
    return NextResponse.json({ error: "Failed to load photo albums" }, { status: 500 });
  }
}
