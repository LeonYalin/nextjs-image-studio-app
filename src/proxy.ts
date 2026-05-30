import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import NextAuth from "next-auth";
import { auth } from "./auth";

// route matching patterns
export const config = {
  matcher: [ '/((?!_next/static|_next/image|favicon.ico).*)' ],
};

// const auth = NextAuth(authConfig);

// main entrypoint function
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // skip static files & bundes
  if (pathname.startsWith('/_next') || pathname.includes('.') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const session = await auth();

  // auth flow
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAuthApi = pathname.startsWith("/api/auth");

  // 1. Unauthenticated users get kicked to /login
  if (!session && !isAuthPage && !isAuthApi) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Authenticated users get kicked AWAY from /login to the home page
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Everything else passes right through naturally
  return NextResponse.next();
}
