import NextAuth from "next-auth";
import { User } from "@/types/user";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // mock implementation
        if (credentials.email === "test@test.com" && credentials.password === "test") {
          const now = Date.now().toString();
          const user: User = {
            id: "1234",
            name: "Test user",
            email: "test@test.com",
            role: "admin",
            avatarUrl: "",
            createdAt: now,
            updatedAt: now,
          };
          return user;
        }
        return null;
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
    jwt({ token, user }) {
      if (user) {
        token.user = user as User;
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


