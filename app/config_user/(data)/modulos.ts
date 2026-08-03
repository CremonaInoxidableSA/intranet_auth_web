import { ApiListResult, ModulosData, ModulosPaginacion } from "@/types/types"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

export type Modulo = ModulosData

type FetchModulosParams = {
  numeroPagina?: number
  filtro?: string | null
}

const PAGINACION_VACIA: ModulosPaginacion = {
  total_paginas: 1,
  total_modulos: 0,
}

function toModuloData(raw: {
  nombre: string
  subdominio: string
  path: string
  icono: string
}): Modulo {
  const { nombre, subdominio, path, icono } = raw
  return {
    nombre,
    subdominio,
    path,
    icono,
  }
}

export async function fetchModulos(
  { numeroPagina = 1, filtro }: FetchModulosParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<ApiListResult<Modulo, ModulosPaginacion>> {
  const query = new URLSearchParams({
    numero_pagina: String(numeroPagina),
    filtro: filtro?.trim() || "0",
  })

  const response = await fetchWithKeycloak(
    `/api/permisos/modulos/lista?${query.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
    }
  )

  if (!response.ok) {
    throw new Error("Error al cargar módulos")
  }

  const result = await response.json()

  return {
    data: (result.data ?? []).map(toModuloData),
    paginacion: result.paginacion ?? PAGINACION_VACIA,
  }
}
