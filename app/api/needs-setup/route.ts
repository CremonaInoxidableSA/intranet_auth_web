import { NextRequest, NextResponse } from "next/server"
import {
  getSetupCache,
  setSetupCache,
  invalidateSetupCache,
} from "@/lib/setup-cache"

const API_AUTH_URL = process.env.API_AUTH_URL ?? "http://192.168.20.150:8000"
const SETUP_SECRET_TOKEN = process.env.SETUP_SECRET_TOKEN

// Validar acceso a needs-setup
function isAuthorizedForSetup(request: NextRequest): boolean {
  // Durante bootstrap o con token secreto válido
  const referer = request.headers.get("referer") || ""
  const authHeader = request.headers.get("x-setup-token")
  const queryToken = request.nextUrl.searchParams.get("setup_token")

  const isBootstrapReferer = referer.includes("/bootstrap")
  const hasValidSecret =
    SETUP_SECRET_TOKEN &&
    (authHeader === SETUP_SECRET_TOKEN || queryToken === SETUP_SECRET_TOKEN)

  return isBootstrapReferer || hasValidSecret
}

async function checkSetupBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${API_AUTH_URL}/needs-setup`, {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`)
    }

    const data = await response.json()
    return data.needs_setup === true
  } catch (error) {
    console.error("Error checking setup status with backend:", error)
    return true
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedForSetup(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cached = getSetupCache()
  if (cached !== null) {
    return NextResponse.json(
      { needs_setup: cached },
      {
        headers: {
          "X-Cached": "true",
          "Cache-Control": "public, max-age=3600, immutable",
          ETag: `"setup-${cached}"`,
        },
      }
    )
  }

  const needsSetup = await checkSetupBackend()

  setSetupCache(needsSetup)

  return NextResponse.json(
    { needs_setup: needsSetup },
    {
      headers: {
        "X-Cached": "false",
        "Cache-Control": "public, max-age=3600, immutable",
        ETag: `"setup-${needsSetup}"`,
      },
    }
  )
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedForSetup(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const path = request.nextUrl.pathname

  if (path.endsWith("/invalidate")) {
    invalidateSetupCache()
    return NextResponse.json(
      { success: true, message: "Setup cache invalidated" },
      { status: 200 }
    )
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
