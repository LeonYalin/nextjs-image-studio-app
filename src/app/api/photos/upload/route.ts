import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { success } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Auth error" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    // validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    // validate file type
    const allowedMimeTypes = [ "image/jpeg", "image/png", "image/webp", "image/gif" ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = path.extname(file.name);
    const photoId = crypto.randomUUID();
    const uniqueFileName = `${photoId}${fileExtension}`;

    // check/create upload directory
    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDirectory, { recursive: true });

    // write the file to it
    const absoluteFilePath = path.join(uploadDirectory, uniqueFileName);
    await fs.writeFile(absoluteFilePath, buffer);

    // save photo metadata to db
    await db.insert(schema.photos).values({
      id: photoId,
      userId: session.user.id,
      storageUrl: `/uploads/${uniqueFileName}`,
    });

    return NextResponse.json({ success: true, id: photoId });
  } catch (error) {
    console.error("Error saving photo");
    return NextResponse.json({ error: "Error uploading photo" }, { status: 500 });
  }

};
