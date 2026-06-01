"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { AuthError } from "next-auth";
import * as schema from "../db/schema";
import * as z from "zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from 'bcrypt';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // use NextAuth hook to log in
    await signIn("credentials", { email, password, redirect: false });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong. Please try again" };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Logou error occured. Please try again" };
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const registerFieldsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(4, "Password must be minimun 4 characters long"),
  });

  const rawData = Object.fromEntries(formData);
  const validatedFields = registerFieldsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors.email?.[ 0 ] || "Invalid form data"
    };
  }

  try {
    // check if user exists. If yes, return error
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, validatedFields.data.email.toLowerCase()))
      .get();

    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);
    const now = new Date();
    await db.insert(schema.users).values({
      id: randomUUID(),
      email: validatedFields.data.email,
      name: validatedFields.data.name,
      passwordHash: hashedPassword,
      role: "admin",
      avatarUrl: "",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Registration error", error);
    return { success: false, error: "Error registering user" };
  }
}
