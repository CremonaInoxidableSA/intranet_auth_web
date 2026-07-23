import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return (
    request.cookies.get("access_token")?.value ||
    request.cookies.get("auth_token")?.value ||
    null
  )
}

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString())
    if (!payload.sub) return false
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Keycloak handles page authentication in the browser. API requests carry
  // the in-memory access token in the Authorization header.
  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/")) {
    const token = getToken(request)
    if (!token || !isTokenValid(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
}
