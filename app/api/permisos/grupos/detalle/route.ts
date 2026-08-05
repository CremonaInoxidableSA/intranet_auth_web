import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL

const getExternalApiUrl = () =>
  API_AUTH_URL ? `${API_AUTH_URL}/grupos/detalles` : null

export async function GET(request: NextRequest) {
  const externalApiUrl = getExternalApiUrl()

  if (!externalApiUrl) {
    return NextResponse.json(
      { error: "Configuracion faltante: NEXT_PUBLIC_API_AUTH_URL" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  const grupoParam = request.nextUrl.searchParams.get("nombre_grupo")
  const externalUrl = new URL(externalApiUrl)
  externalUrl.searchParams.set("nombre_grupo", grupoParam ?? "")

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null

  if (!token) {
    return NextResponse.json(
      { error: "No autorizado: falta el token" },
      { status: 401 }
    )
  }

  let externalResponse: Response
  try {
    externalResponse = await fetch(externalUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con la API de autenticacion" },
      { status: 502 }
    )
  }

  const contentType = externalResponse.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  const rawData = isJson
    ? await externalResponse.json().catch(() => null)
    : await externalResponse.text().catch(() => "")

  const data =
    rawData && typeof rawData === "object"
      ? (rawData as Record<string, unknown>)
      : null

  if (!externalResponse.ok) {
    return NextResponse.json(
      {
        error:
          (typeof data?.detail === "string" && data.detail) ||
          (typeof data?.message === "string" && data.message) ||
          (typeof data?.error === "string" && data.error) ||
          (typeof rawData === "string" && rawData.trim()) ||
          "Error al obtener la lista de grupos",
      },
      { status: externalResponse.status }
    )
  }

  if (!rawData) {
    return NextResponse.json(
      { error: "La API de autenticacion devolvio una respuesta vacia" },
      { status: 502 }
    )
  }

  return NextResponse.json(data, { status: externalResponse.status })
}
