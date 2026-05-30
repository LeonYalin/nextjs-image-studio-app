"use server";

import { signIn, signOut } from "@/auth";
import { User } from "@/types/user";
import { randomUUID } from "crypto";
import { AuthError } from "next-auth";
import * as z from "zod";

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
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(4),
  });

  const rawData = Object.fromEntries(formData);
  const validatedFields = registerFieldsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 1. MOCK DATABASE CHECK (Replace this with: await db.select().from(users)...)
    if (email === "test@test.com") {
      return { success: false, error: "User already exists" };
    }

    // 2. PASSWORD HASHING (In production, use a library like bcryptjs)
    // const hashedPassword = await bcrypt.hash(password, 10);

    const now = Date.now().toString();
    const newUser: User = {
      id: randomUUID(),
      email,
      name,
      role: "admin",
      avatarUrl: "",
      createdAt: now,
      updatedAt: now,
    };

    console.log("saving nwe account to the database");
    // await db.insert(users).values({ ...newUser, password: hashedPassword });

    return { success: true, error: null };
  } catch (error) {
    console.error("Registration error", error);
    return { success: false, error: "Error registering user" };
  }
}
