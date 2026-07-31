import { ApiListResult, GruposData, UsersData } from "@/types/types"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

type FetchUsuariosParams = {
  numeroPagina?: number
  filtro?: string | null
}

const PAGINACION_VACIA = { total_paginas: 1, total_usuarios: 0 }

function toUsersData(raw: {
  id: string
  email: string
  nombre: string
  apellido: string
  habilitado: boolean
  grupos: GruposData[]
}): UsersData {
  const { id, habilitado, nombre, apellido, ...resto } = raw
  return {
    ...resto,
    nombre,
    apellido,
    extra: {
      id,
      habilitado,
      apellidoNombre: `${apellido} ${nombre}`.trim() || "—",
    },
  }
}

export async function fetchUsuarios(
  { numeroPagina = 1, filtro }: FetchUsuariosParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<ApiListResult<UsersData>> {
  const query = new URLSearchParams({
    numero_pagina: String(numeroPagina),
    filtro: filtro?.trim() || "0",
  })

  const response = await fetchWithKeycloak(
    `/api/usuarios/lista?${query.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
    }
  )

  if (!response.ok) {
    throw new Error("Error al cargar usuarios")
  }

  const result = await response.json()

  return {
    data: (result.data ?? []).map(toUsersData),
    paginacion: result.paginacion ?? PAGINACION_VACIA,
  }
}
