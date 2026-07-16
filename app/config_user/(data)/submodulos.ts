export type Submodulo = {
  id?: number
  nombre?: string
  modulo?: string
  descripcion?: string
}

const normalizeResponse = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response
  if (response && typeof response === "object") {
    const maybeData = (response as { data?: unknown }).data
    if (Array.isArray(maybeData)) return maybeData
  }
  return []
}

export async function fetchSubmodulos(
  headers: Record<string, string> = { Accept: "application/json" }
): Promise<Submodulo[]> {
  const res = await fetch("/api/submodulos/lista-submodulos", {
    method: "GET",
    headers,
  })

  if (!res.ok) {
    throw new Error("Error al cargar submódulos")
  }

  const data = await res.json()
  return normalizeResponse<Submodulo>(data)
}
