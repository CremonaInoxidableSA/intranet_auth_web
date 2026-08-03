import { ApiListResult, PermisosData, PermisosPaginacion } from "@/types/types"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

type FetchPermisosParams = {
  numeroPagina?: number
  filtro?: string | null
}

const PAGINACION_VACIA: PermisosPaginacion = {
  total_paginas: 1,
  total_permisos: 0,
}

function toPermisoData(raw: { nombre: string }): PermisosData {
  const { nombre } = raw
  return {
    nombre,
  }
}

export async function fetchPermisos(
  { numeroPagina = 1, filtro }: FetchPermisosParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<ApiListResult<PermisosData, PermisosPaginacion>> {
  const query = new URLSearchParams({
    numero_pagina: String(numeroPagina),
    filtro: filtro?.trim() || "0",
  })

  const response = await fetchWithKeycloak(
    `/api/permisos/permisos/lista?${query.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
    }
  )

  if (!response.ok) {
    throw new Error("Error al cargar permisos")
  }

  const result = await response.json()

  return {
    data: (result.data ?? []).map(toPermisoData),
    paginacion: result.paginacion ?? PAGINACION_VACIA,
  }
}
