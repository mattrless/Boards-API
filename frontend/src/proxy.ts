import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token);
  const isProtectedPath =
    pathname.startsWith("/boards") || pathname.startsWith("/admin");

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/" && isAuthenticated) {
    const boardsUrl = request.nextUrl.clone();
    boardsUrl.pathname = "/boards";
    return NextResponse.redirect(boardsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/boards/:path*", "/admin/:path*"],
};
