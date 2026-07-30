export interface Grupo extends Record<string, unknown> {
  id: number
  rol: string
  nombre?: string
  descripcion: string
}

import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

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
