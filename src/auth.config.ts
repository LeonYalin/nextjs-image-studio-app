import type { NextAuthConfig } from "next-auth";
import { User } from "./db/schema";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user as User;
      }
      return token;
    },
    session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    }
  },
  providers: [], // Keep this empty here; we inject providers in the next step
} satisfies NextAuthConfig;
