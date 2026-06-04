import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const publicRoutes = ["/login", "/register", "/bootstrap"];
const adminRoutes = ["/config_user", "/api/config"];
const routesWithOwnToken = ["/login/recuperacion/reset_pass"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const usesOwnToken = routesWithOwnToken.some((route) =>
    pathname.startsWith(route),
  );

  const tokenFromQuery = request.nextUrl.searchParams.get("token");
  if (tokenFromQuery && !usesOwnToken) {
    const verified = verifyToken(tokenFromQuery);
    if (verified) {
      const cleanUrl = new URL(request.nextUrl.pathname, request.url);
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set("access_token", tokenFromQuery, { path: "/" });
      return response;
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  let token =
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("access_token")?.value ||
    request.cookies.get("accessToken")?.value ||
    null;

  if (!token) {
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.split(" ", 2)[1];
    }
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    if (
      token &&
      (pathname.startsWith("/login") || pathname.startsWith("/register"))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = verifyToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    response.cookies.delete("access_token");
    response.cookies.delete("accessToken");
    return response;
  }

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute && user.rol !== "admin" && user.rol !== "superadmin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
