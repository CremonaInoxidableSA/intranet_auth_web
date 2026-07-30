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
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<Grupo[]> {
  try {
    const response = await fetchWithKeycloak("/api/grupos/lista", {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data ?? []
  } catch {
    return []
  }
}
