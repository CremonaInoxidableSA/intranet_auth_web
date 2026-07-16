import { NextRequest, NextResponse } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL ?? "http://192.168.20.151:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id_usuario,
      nombre,
      apellido,
      legajo,
      dni,
      email,
      rol_ids,
      username,
      password,
    } = body

    if (
      nombre == null ||
      apellido == null ||
      legajo == null ||
      dni == null ||
      email == null ||
      !Array.isArray(rol_ids) ||
      rol_ids.length === 0 ||
      username == null ||
      password == null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos son obligatorios",
        },
        { status: 400 }
      )
    }

    const response = await fetch(`${API_AUTH_URL}/crear_o_editar_usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario,
        nombre,
        apellido,
        legajo,
        dni,
        email,
        rol_ids,
        username,
        password,
      }),
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error("Error en proxy crear_o_editar_usuario:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
