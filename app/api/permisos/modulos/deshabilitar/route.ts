import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getExternalApiUrl } from "@/app/api/_utils/authApi"

const EXTERNAL_API_URL = getExternalApiUrl("/modulos/deshabilitar")

export async function PUT(request: NextRequest) {
  if (!EXTERNAL_API_URL) {
    return NextResponse.json(
      { error: "Configuracion faltante: NEXT_PUBLIC_API_AUTH_URL" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const moduloNombre =
    request.nextUrl.searchParams.get("modulo_nombre") ??
    request.nextUrl.searchParams.get("nombre")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  if (!moduloNombre) {
    return NextResponse.json({ error: "Falta modulo_nombre" }, { status: 400 })
  }

  const externalUrl = new URL(EXTERNAL_API_URL)
  externalUrl.searchParams.set("modulo_nombre", moduloNombre)

  const externalResponse = await fetch(externalUrl.toString(), {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await externalResponse.json().catch(() => null)

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error: data?.detail ?? data?.message ?? "Error al deshabilitar módulo",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
