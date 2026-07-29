import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL + "/usuarios/lista"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const numero_pagina = request.headers.get("numero_pagina")
  const filtro = request.headers.get("filtro")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  const externalResponse = await fetch(`${EXTERNAL_API_URL}?numero_pagina=${numero_pagina}&filtro=${filtro}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }
  })

  const data = await externalResponse.json().catch(() => null)

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error:
          data?.detail ?? data?.message ?? "Error al obtener la lista de usuarios",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
