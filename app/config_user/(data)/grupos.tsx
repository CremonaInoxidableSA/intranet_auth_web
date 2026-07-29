export type Grupo = {
  id?: number
  rol?: string
  nombre?: string
  descripcion?: string
}

import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

function normalizeResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response
  if (response && typeof response === "object") {
    const maybeData = (response as { data?: unknown }).data
    if (Array.isArray(maybeData)) return maybeData
  }
  return []
}

export async function fetchGrupos(
  headers: Record<string, string> = { Accept: "application/json" }
): Promise<Grupo[]> {
  const res = await fetchWithKeycloak("/api/grupos/lista-grupos", {
    method: "GET",
    headers,
  })

  if (!res.ok) {
    throw new Error("Error al cargar grupos")
  }

  const data = await res.json()
  return normalizeResponse<Grupo>(data)
}
