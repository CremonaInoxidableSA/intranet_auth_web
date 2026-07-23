export type Modulo = {
  id?: number
  nombre?: string
  descripcion?: string
}

import { fetchWithKeycloak } from "@/lib/keycloak-fetch"

const normalizeResponse = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response
  if (response && typeof response === "object") {
    const maybeData = (response as { data?: unknown }).data
    if (Array.isArray(maybeData)) return maybeData
  }
  return []
}

export async function fetchModulos(
  headers: Record<string, string> = { Accept: "application/json" }
): Promise<Modulo[]> {
  const res = await fetchWithKeycloak("/api/modulos/lista-modulos", {
    method: "GET",
    headers,
  })

  if (!res.ok) {
    throw new Error("Error al cargar módulos")
  }

  const data = await res.json()
  return normalizeResponse<Modulo>(data)
}
