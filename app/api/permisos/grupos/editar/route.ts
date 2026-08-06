import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getExternalApiUrl } from "@/app/api/_utils/authApi"

const EXTERNAL_API_URL = getExternalApiUrl("/grupos/editar")

export async function PUT(request: NextRequest) {
  if (!EXTERNAL_API_URL) {
    return NextResponse.json(
      { error: "Configuracion faltante: NEXT_PUBLIC_API_AUTH_URL" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId =
    request.nextUrl.searchParams.get("grupo_nombre") ??
    request.nextUrl.searchParams.get("nombre")

  if (!userId) {
    return NextResponse.json(
      { error: "Falta el identificador del grupo" },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  const externalUrl = new URL(EXTERNAL_API_URL)
  externalUrl.searchParams.set("grupo_nombre", userId)
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
