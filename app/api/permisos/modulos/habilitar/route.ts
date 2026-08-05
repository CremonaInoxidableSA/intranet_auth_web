import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL + "/grupos/habilitar?modulo_nombre="

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const userIdParam = request.nextUrl.searchParams.get("user_id")

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
  externalUrl.searchParams.set("user_id", userIdParam ?? "")

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
        error: data?.detail ?? data?.message ?? "Error al habilitar usuario",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
