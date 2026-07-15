import { NextRequest, NextResponse } from "next/server"
import { getSetupCache, setSetupCache } from "@/lib/setup-cache"

const API_AUTH_URL = process.env.API_AUTH_URL ?? "http://192.168.20.150:8000"

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
    return false
  }
}

export async function GET(_request: NextRequest) {
  const cached = getSetupCache()
  if (cached !== null) {
    return NextResponse.json(
      { needs_setup: cached },
      {
        headers: {
          "X-Cached": "true",
          "Cache-Control": "no-store",
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
        "Cache-Control": "no-store",
      },
    }
  )
}
