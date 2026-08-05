import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL + "/grupos/eliminar?grupo_nombre="

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const grupoNombreParam = request.nextUrl.searchParams.get("grupo_nombre")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  const externalUrl = new URL(API_AUTH_URL)
  externalUrl.searchParams.set("grupo_nombre", grupoNombreParam ?? "")

  const externalResponse = await fetch(externalUrl.toString(), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await externalResponse.json().catch(() => null)

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error: data?.detail ?? data?.message ?? "Error al eliminar grupo",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
