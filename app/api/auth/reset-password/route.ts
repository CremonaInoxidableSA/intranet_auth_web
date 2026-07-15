import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${API_AUTH_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error al resetear password:", error)
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
