import { InferSelectModel, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type UserRole = "user" | "admin" | "sysadmin";

// USERS table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").$type<UserRole>().notNull().default("user"),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// PHOTOS table
export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  storageUrl: text("storage_url").notNull(), // local paths like "/uploads/my-photo.jpg"
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  userIdIdx: index("photos_user_id_idx").on(table.userId),
}));

// ALBUMS table
export const albums = sqliteTable("albums", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  userIdIdx: index("albums_user_id_idx").on(table.userId),
}));

// ALBUM PHOTOS (JUNCTION TABLE)
export const albumPhotos = sqliteTable("album_photos", {
  albumId: text("album_id").notNull().references(() => albums.id, { onDelete: "cascade" }),
  photoId: text("photo_id").notNull().references(() => photos.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [ table.albumId, table.photoId ] }),
}));

type DbUser = InferSelectModel<typeof users>;
export type User = Omit<DbUser, "passwordHash">;
export type NewUser = DbUser;
export type Photo = InferSelectModel<typeof photos>;
export type Album = InferSelectModel<typeof albums>;
export type AlbumPhoto = InferSelectModel<typeof albumPhotos>;

