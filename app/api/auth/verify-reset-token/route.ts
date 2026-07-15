import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Token no proporcionado" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `${API_AUTH_URL}/reset-password?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error al verificar token:", error)
    return NextResponse.json(
      { success: false, error: "Error de conexión con el backend" },
      { status: 500 }
    )
  }
}
