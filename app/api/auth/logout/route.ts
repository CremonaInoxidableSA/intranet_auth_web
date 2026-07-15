import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${API_AUTH_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error en logout proxy:", error)
    return NextResponse.json({ success: true })
  }
}
