// src/types/next-auth.d.ts
import { User as CustomUser } from "@/db/schema";
import { type DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains the session data.
   */
  interface Session {
    user: CustomUser & DefaultSession[ "user" ];
  }

  /**
   * The shape of the user object returned in the OAuth profile or authorize callback.
   */
  interface User extends CustomUser { }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and accessible in the `session` callback.
   */
  interface JWT extends DefaultJWT {
    user?: CustomUser;
  }
}
