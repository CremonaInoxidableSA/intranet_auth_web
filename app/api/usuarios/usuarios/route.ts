import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (typeof id !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "El id del usuario es obligatorio",
        },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_AUTH_URL}/tu_endpoint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_user_id: id,
      }),
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error("Error en proxy:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
