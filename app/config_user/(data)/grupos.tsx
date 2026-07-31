import { ApiListResult } from "@/types/types"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

type FetchGruposParams = {
  numeroPagina?: number
  filtro?: string | null
}

const PAGINACION_VACIA = { total_paginas: 1, total_usuarios: 0 }

function toUsersData(raw: { nombre: string }): { nombre: string } {
  const { nombre } = raw
  return {
    nombre,
  }
}

export async function fetchGrupos(
  { numeroPagina = 1, filtro }: FetchGruposParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<ApiListResult<{ nombre: string }>> {
  const query = new URLSearchParams({
    numero_pagina: String(numeroPagina),
    filtro: filtro?.trim() || "0",
  })

  const response = await fetchWithKeycloak(
    `/api/grupos/lista?${query.toString()}`,
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
    data: (result.data ?? []).map(toUsersData),
    paginacion: result.paginacion ?? PAGINACION_VACIA,
  }
}
