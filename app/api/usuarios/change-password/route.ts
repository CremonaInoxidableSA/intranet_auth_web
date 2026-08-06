import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getExternalApiUrl } from "@/app/api/_utils/authApi"

const EXTERNAL_API_URL = getExternalApiUrl("/personal/change-password")

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

  const body = await request.json().catch(() => null)
  const user_id = body?.user_id ?? request.nextUrl.searchParams.get("user_id")
  const password =
    body?.password ?? request.nextUrl.searchParams.get("password")
  const password_confirmation =
    body?.password_confirmation ??
    request.nextUrl.searchParams.get("password_confirmation")

  if (!user_id) {
    return NextResponse.json({ error: "Falta user_id" }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ error: "Falta contraseña" }, { status: 400 })
  }

  if (!password_confirmation) {
    return NextResponse.json(
      { error: "Falta la confirmación de contraseña" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(EXTERNAL_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id,
        password,
        password_confirmation,
      }),
    })

    const data = await response.json().catch(() => null)
    return NextResponse.json(data ?? { ok: true }, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: "Error al conectar con la API externa" },
      { status: 502 }
    )
  }
}
