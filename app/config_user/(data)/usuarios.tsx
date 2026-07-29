import { User } from "../(table)/columns"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

type UserId = string | number

type FetchUsuariosParams = {
  numeroPagina?: number
  filtro?: string | null
}

type UsuariosPaginacion = {
  total_paginas: number
  total_usuarios: number
}

export type FetchUsuariosResult = {
  users: User[]
  paginacion: UsuariosPaginacion
}

function normalizeUserId(raw: unknown): UserId | undefined {
  if (typeof raw === "number" || typeof raw === "string") return raw
  return undefined
}

function normalizePaginacion(response: unknown): UsuariosPaginacion {
  if (!response || typeof response !== "object") {
    return { total_paginas: 1, total_usuarios: 0 }
  }

  const maybePaginacion = (response as { paginacion?: unknown }).paginacion
  if (!maybePaginacion || typeof maybePaginacion !== "object") {
    return { total_paginas: 1, total_usuarios: 0 }
  }

  const totalPaginas = Number(
    (maybePaginacion as { total_paginas?: unknown }).total_paginas
  )
  const totalUsuarios = Number(
    (maybePaginacion as { total_usuarios?: unknown }).total_usuarios
  )

  return {
    total_paginas:
      Number.isFinite(totalPaginas) && totalPaginas > 0 ? totalPaginas : 1,
    total_usuarios:
      Number.isFinite(totalUsuarios) && totalUsuarios >= 0 ? totalUsuarios : 0,
  }
}

function normalizeUsers(response: unknown): User[] {
  if (!response || typeof response !== "object") return []
  const maybeData = (response as { data?: unknown }).data
  if (!Array.isArray(maybeData)) return []

  return maybeData.map((rawUser) => {
    const user = rawUser as User & {
      nombre?: unknown
      apellido?: unknown
      enabled?: unknown
      rol?: unknown
      user_id?: unknown
      usuario_id?: unknown
    }

    const nombre = typeof user.nombre === "string" ? user.nombre : ""
    const apellido = typeof user.apellido === "string" ? user.apellido : ""

    const rawGrupos = user.grupos
    const grupos = Array.isArray(rawGrupos)
      ? rawGrupos.filter((item): item is string => typeof item === "string")
      : typeof user.rol === "string"
        ? [user.rol]
        : undefined

    const habilitadoRaw =
      typeof user.habilitado === "boolean" ||
      typeof user.habilitado === "number"
        ? user.habilitado
        : user.enabled

    const habilitado =
      typeof habilitadoRaw === "boolean"
        ? habilitadoRaw
          ? 1
          : 0
        : typeof habilitadoRaw === "number"
          ? habilitadoRaw
          : 0

    const apellidoNombre =
      `${apellido} ${nombre}`.trim() ||
      (typeof user.apellidoNombre === "string" ? user.apellidoNombre : "—")

    return {
      ...user,
      id:
        normalizeUserId(user.id) ??
        normalizeUserId(user.user_id) ??
        normalizeUserId(user.usuario_id),
      apellidoNombre,
      grupos,
      habilitado,
    }
  })
}

export async function fetchUsuarios(
  userId: number | undefined,
  params: FetchUsuariosParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<FetchUsuariosResult> {
  if (typeof userId !== "number") {
    return {
      users: [],
      paginacion: { total_paginas: 1, total_usuarios: 0 },
    }
  }

  const page =
    Number.isInteger(Number(params.numeroPagina)) &&
    Number(params.numeroPagina) > 0
      ? Number(params.numeroPagina)
      : 1
  const filtro =
    params.filtro && params.filtro.trim() !== "" ? params.filtro.trim() : "0"

  const query = new URLSearchParams({
    numero_pagina: String(page),
    filtro,
  })

  const response = await fetchWithKeycloak(
    `/api/usuarios/lista?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...headers,
      },
    }
  )

  if (!response.ok) {
    throw new Error("Error al cargar usuarios")
  }

  const data = await response.json()
  const users = normalizeUsers(data)
  const paginacion = normalizePaginacion(data)

  return {
    users,
    paginacion,
  }
}
