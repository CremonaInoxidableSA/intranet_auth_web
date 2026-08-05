import { ApiListResult, GruposData, GruposPaginacion } from "@/types/types"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

type FetchGruposParams = {
  numeroPagina?: number
  filtro?: string | null
}

const PAGINACION_VACIA: GruposPaginacion = { total_paginas: 1, total_grupos: 0 }

function toGruposData(raw: { nombre: string }): GruposData {
  const { nombre } = raw
  return {
    nombre,
  }
}

export async function fetchGrupos(
  { numeroPagina = 1, filtro }: FetchGruposParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<ApiListResult<GruposData, GruposPaginacion>> {
  const query = new URLSearchParams({
    numero_pagina: String(numeroPagina),
    filtro: filtro?.trim() || "0",
  })

  const response = await fetchWithKeycloak(
    `/api/permisos/grupos/lista?${query.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
    }
  )

  if (!response.ok) {
    throw new Error("Error al cargar grupos")
  }

  const result = await response.json()

  return {
    data: (result.data ?? []).map(toGruposData),
    paginacion: result.paginacion ?? PAGINACION_VACIA,
  }
}
