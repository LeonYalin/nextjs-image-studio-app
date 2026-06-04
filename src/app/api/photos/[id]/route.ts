import { auth } from "@/auth";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const { id } = await params;

    // ownership-scoped lookup: a photo only belongs to the session user
    const photo = await db
      .select()
      .from(schema.photos)
      .where(and(eq(schema.photos.id, id), eq(schema.photos.userId, session.user.id)))
      .get();

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // remove the DB row first (album_photos rows cascade away)
    await db.delete(schema.photos).where(eq(schema.photos.id, id));

    // best-effort: remove the underlying file from public/uploads
    try {
      const fileName = path.basename(photo.storageUrl);
      const absolutePath = path.join(process.cwd(), "public", "uploads", fileName);
      await fs.unlink(absolutePath);
    } catch {
      // file already gone / never written — not fatal
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo", error);
    return NextResponse.json({ error: "Error deleting photo" }, { status: 500 });
  }
}
