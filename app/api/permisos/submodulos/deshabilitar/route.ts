import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL +
  "/submodulos/deshabilitar?submodulo_nombre="

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const submoduloNombre = request.nextUrl.searchParams.get("submodulo_nombre")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  if (!submoduloNombre) {
    return NextResponse.json(
      { error: "Falta submodulo_nombre" },
      { status: 400 }
    )
  }

  const externalUrl = `${EXTERNAL_API_URL}${encodeURIComponent(submoduloNombre)}`

  const externalResponse = await fetch(externalUrl, {
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
        error:
          data?.detail ?? data?.message ?? "Error al deshabilitar submódulo",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
