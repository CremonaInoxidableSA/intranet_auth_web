import {
  ApiListResult,
  FetchParams,
  SubmodulosData,
  Paginacion,
} from "@/types/types"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

const PAGINACION_VACIA: Paginacion = {
  total_paginas: 1,
  total_registros: 0,
}

function toSubmoduloData(raw: {
  nombre: string
  modulo_padre: string
  path: string
  icono: string
  habilitado?: boolean | string | number | null
}): SubmodulosData {
  const { nombre, modulo_padre, path, icono, habilitado } = raw

  const habilitadoNormalizado =
    habilitado === true || habilitado === "true" || habilitado === 1

  return {
    nombre,
    modulo_padre,
    path,
    icono,
    habilitado: habilitadoNormalizado,
  }
}

export async function fetchSubmodulos(
  { numeroPagina = 1, filtro }: FetchParams = {},
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<ApiListResult<SubmodulosData>> {
  const query = new URLSearchParams({
    numero_pagina: String(numeroPagina),
    filtro: filtro?.trim() || "0",
  })

  const response = await fetchWithKeycloak(
    `/api/permisos/submodulos/lista?${query.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
    }
  )

  if (!response.ok) {
    throw new Error("Error al cargar submódulos")
  }

  const result = await response.json()

  return {
    data: (result.data ?? []).map(toSubmoduloData),
    paginacion: result.paginacion ?? PAGINACION_VACIA,
  }
}
