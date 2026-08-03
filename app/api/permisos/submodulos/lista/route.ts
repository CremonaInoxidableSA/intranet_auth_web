import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_AUTH_URL + "/submodulos/lista"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const numeroPaginaParam = request.nextUrl.searchParams.get("numero_pagina")
  const filtroParam = request.nextUrl.searchParams.get("filtro")

  const numero_pagina =
    Number.isInteger(Number(numeroPaginaParam)) && Number(numeroPaginaParam) > 0
      ? String(Number(numeroPaginaParam))
      : "1"

  const filtro = filtroParam && filtroParam.trim() !== "" ? filtroParam : "0"

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  const externalUrl = new URL(EXTERNAL_API_URL)
  externalUrl.searchParams.set("numero_pagina", numero_pagina)
  externalUrl.searchParams.set("filtro", filtro)

  const externalResponse = await fetch(externalUrl.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await externalResponse.json().catch(() => null)

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error:
          data?.detail ??
          data?.message ??
          "Error al obtener la lista de submódulos",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
