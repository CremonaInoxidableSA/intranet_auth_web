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

async function getBootstrapStatus(request: NextRequest): Promise<boolean> {
  try {
    const url = new URL("/api/bootstrap/needs-setup", request.url)
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    })
    if (!response.ok) return false
    const data = await response.json()
    return data.needs_setup === true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = getToken(request)

  // 1. Rutas API públicas (auth y bootstrap)
  if (
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/bootstrap/")
  ) {
    return NextResponse.next()
  }

  // 2. Rutas API protegidas (resto de /api/)
  if (pathname.startsWith("/api/")) {
    if (!token || !isTokenValid(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // 3. Páginas públicas (sin autenticación)
  const publicPages = [
    "/login",
    "/login/recuperacion",
    "/reset-password",
    "/bootstrap",
  ]
  const isPublicPage = publicPages.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (isPublicPage) {
    // Si es /login, verificar si necesita bootstrap
    if (pathname === "/login") {
      const needsSetup = await getBootstrapStatus(request)
      if (needsSetup) {
        return NextResponse.redirect(new URL("/bootstrap", request.url))
      }
    }

    // Si es /bootstrap, verificar que realmente se necesite
    if (pathname.startsWith("/bootstrap")) {
      const needsSetup = await getBootstrapStatus(request)
      if (!needsSetup) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    return NextResponse.next()
  }

  // 4. Páginas protegidas (requieren autenticación)
  if (!token || !isTokenValid(token)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
}
