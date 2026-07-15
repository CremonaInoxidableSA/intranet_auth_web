import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

  if (pathname.startsWith("/api/bootstrap/")) {
    return NextResponse.next()
  }

  if (pathname === "/login") {
    const needsSetup = await getBootstrapStatus(request)
    if (needsSetup) {
      return NextResponse.redirect(new URL("/bootstrap", request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/bootstrap")) {
    const needsSetup = await getBootstrapStatus(request)
    if (!needsSetup) {
      return NextResponse.redirect(new URL("/login", request.url))
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
