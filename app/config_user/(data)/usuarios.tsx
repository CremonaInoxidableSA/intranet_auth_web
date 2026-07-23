import { User } from "../(table)/columns"
import { fetchWithKeycloak } from "@/lib/keycloak-fetch"

function normalizeResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response
  if (response && typeof response === "object") {
    const maybeData = (response as { data?: unknown }).data
    if (Array.isArray(maybeData)) return maybeData
  }
  return []
}

export async function fetchUsuarios(
  userId: number | undefined,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Promise<User[]> {
  if (typeof userId !== "number") return []

  const res = await fetchWithKeycloak("/api/usuarios/usuarios", {
    method: "POST",
    headers,
    body: JSON.stringify({ current_user_id: userId }),
  })

  if (!res.ok) {
    throw new Error("Error al cargar usuarios")
  }

  const data = await res.json()
  const users = normalizeResponse<User>(data)

  return users.map((user) => {
    const rawRoles = (user as unknown as { roles?: unknown }).roles
    const roles = Array.isArray(rawRoles)
      ? rawRoles.filter((item): item is string => typeof item === "string")
      : typeof (user as unknown as { rol?: unknown }).rol === "string"
        ? [(user as unknown as { rol: string }).rol]
        : undefined

    return {
      ...user,
      id:
        user.id ??
        (user as unknown as { user_id?: number }).user_id ??
        (user as unknown as { usuario_id?: number }).usuario_id,
      roles,
      habilitado:
        typeof user.habilitado === "boolean"
          ? user.habilitado
            ? 1
            : 0
          : typeof user.habilitado === "number"
            ? user.habilitado
            : 0,
    }
  })
}
