import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function POST(request: NextRequest) {
  try {
    const { current_user_id, usuario_id } = await request.json()

    if (typeof current_user_id !== "number" || typeof usuario_id !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "current_user_id y usuario_id son obligatorios",
        },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_AUTH_URL}/habilitar_usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_user_id,
        usuario_id,
      }),
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error("Error en proxy habilitar_usuario:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
