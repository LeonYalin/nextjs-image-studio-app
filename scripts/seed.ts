import * as schema from "../src/db/schema";
import { db } from "@/db";

(async function main() {
  console.log("🌱 Starting database sync and seeding...");

  try {
    await db.transaction(async tx => {

      // start from scratch - delete tables in dependencies order
      await tx.delete(schema.albumPhotos);
      await tx.delete(schema.albums);
      await tx.delete(schema.photos);
      await tx.delete(schema.users);

      // seed user
      const now = new Date();
      const mockUser: schema.NewUser = {
        id: "user_1",
        name: "Test user",
        email: "test@test.com",
        role: "admin",
        passwordHash: "password_hash",
        avatarUrl: "",
        createdAt: now,
        updatedAt: now,
      };
      await tx.insert(schema.users).values(mockUser);

      // seed photos
      await tx.insert(schema.photos).values([
        { id: "photo_1", userId: mockUser.id, storageUrl: "uploads/photo1.jpg" },
        { id: "photo_2", userId: mockUser.id, storageUrl: "uploads/photo2.jpg" },
      ]);

      // seed albums
      await tx.insert(schema.albums).values(
        { id: "album_1", userId: mockUser.id, title: "Album title 1" },
      );

      // seed album photos
      await tx.insert(schema.albumPhotos).values(
        { albumId: "album_1", photoId: "photo_1" },
      );

      console.log("✅ Seeding completed successfully.");
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
})();
