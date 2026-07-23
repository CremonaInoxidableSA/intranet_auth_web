export type Role = {
  id?: number
  rol?: string
  nombre?: string
  descripcion?: string
}

import { fetchWithKeycloak } from "@/lib/keycloak-fetch"

function normalizeResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response
  if (response && typeof response === "object") {
    const maybeData = (response as { data?: unknown }).data
    if (Array.isArray(maybeData)) return maybeData
  }
  return []
}

export async function fetchRoles(
  headers: Record<string, string> = { Accept: "application/json" }
): Promise<Role[]> {
  const res = await fetchWithKeycloak("/api/roles/lista-roles", {
    method: "GET",
    headers,
  })

  if (!res.ok) {
    throw new Error("Error al cargar roles")
  }

  const data = await res.json()
  return normalizeResponse<Role>(data)
}
