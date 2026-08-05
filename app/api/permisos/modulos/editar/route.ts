import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL + "/grupos/editar?modulo_nombre="

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId =
    request.nextUrl.searchParams.get("modulo_nombre") ??
    request.nextUrl.searchParams.get("nombre")

  if (!userId) {
    return NextResponse.json(
      { error: "Falta el identificador del módulo" },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const externalUrl = new URL(EXTERNAL_API_URL)
  externalUrl.searchParams.set("modulo_nombre", userId)
  externalUrl.searchParams.set("nombre", userId)

  try {
    const response = await fetch(externalUrl.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: "Error al conectar con la API externa" },
      { status: 502 }
    )
  }
}
