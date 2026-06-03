import { auth } from "@/auth";
import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const photos = await db
      .select()
      .from(schema.photos)
      .where(eq(schema.photos.userId, session.user.id))
      .orderBy(desc(schema.photos.createdAt));

    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: "Error getting photos" }, { status: 500 });
  }
}
