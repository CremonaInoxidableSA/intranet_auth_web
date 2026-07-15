import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "No token" },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_AUTH_URL}/check`, {
      method: "GET",
      headers: { Authorization: authHeader },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error en check proxy:", error)
    return NextResponse.json(
      { success: false, message: "Error interno" },
      { status: 500 }
    )
  }
}
