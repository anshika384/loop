import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Match only dashboard routes to protect them
export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};
