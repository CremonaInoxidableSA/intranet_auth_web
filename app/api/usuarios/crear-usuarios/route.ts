import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL + "/usuarios/crear-usuario"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const payload = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "Payload inválido para crear usuario" },
      { status: 400 }
    )
  }

  const externalResponse = await fetch(EXTERNAL_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await externalResponse.json().catch(() => null)

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error: data?.detail ?? data?.message ?? "Error al crear usuario",
      },
      { status: externalResponse.status }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
