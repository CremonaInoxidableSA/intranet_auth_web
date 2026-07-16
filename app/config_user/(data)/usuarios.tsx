import { User } from "../(table)/columns"

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

  const res = await fetch("/api/usuarios/usuarios", {
    method: "POST",
    headers,
    body: JSON.stringify({ current_user_id: userId }),
  })

  if (!res.ok) {
    throw new Error("Error al cargar usuarios")
  }

  const data = await res.json()
  const users = normalizeResponse<User>(data)

  return users.map((user) => ({
    ...user,
    id:
      user.id ??
      (user as unknown as { user_id?: number }).user_id ??
      (user as unknown as { usuario_id?: number }).usuario_id,
    rol:
      user.rol ??
      (Array.isArray((user as unknown as { roles?: unknown }).roles)
        ? String((user as unknown as { roles: unknown[] }).roles[0] ?? "")
        : undefined) ??
      "",
    habilitado:
      typeof user.habilitado === "boolean"
        ? user.habilitado
          ? 1
          : 0
        : typeof user.habilitado === "number"
          ? user.habilitado
          : 0,
  }))
}
