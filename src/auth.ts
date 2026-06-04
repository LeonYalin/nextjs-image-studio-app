import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { User } from "./db/schema";
import { db } from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email).toLowerCase();
        const password = String(credentials.password);

        if (!email || !password) return null;

        const user = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1)
          .get(); // the get() here is because by default result is an array

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordIsValid = bcrypt.compare(password, user.passwordHash);
        if (!passwordIsValid) {
          return null;
        }

        // strip password prop
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // server side callback
    // happens after the "authorize"
    // save user data into token payload
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = user as User;
      }
      // when the client calls useSession().update(...), merge the new fields
      // so name/avatar changes show up without re-logging in
      if (trigger === "update" && session?.user && token.user) {
        token.user = { ...token.user, ...session.user };
      }
      return token;
    },
    // client side callback -> send to javascript later
    // happens after the "jwt".
    session({ session, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    }
  }
});


