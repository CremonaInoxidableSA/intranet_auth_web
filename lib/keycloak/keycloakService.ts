import keycloak, { initKeycloakOnce } from "@/lib/keycloak/keycloak"
import { UserSession } from "@/types/types"

export async function buildUserSession(): Promise<UserSession | null> {
  if (!keycloak.authenticated) {
    return null
  }

  let profile: Awaited<ReturnType<typeof keycloak.loadUserProfile>> | undefined
  try {
    profile = await keycloak.loadUserProfile()
  } catch (error) {
    console.warn(
      "No se pudo cargar el perfil de Keycloak; se usaran los claims del token",
      error
    )
  }

  const tokenParsed = keycloak.tokenParsed as
    | Record<string, unknown>
    | undefined
  const roles =
    (tokenParsed?.realm_access as { roles?: string[] } | undefined)?.roles ?? []

  return {
    id: tokenParsed?.sub ? Number(tokenParsed.sub) : undefined,
    email: profile?.email ?? (tokenParsed?.email as string | undefined),
    username:
      (profile?.username as string | undefined) ??
      (tokenParsed?.preferred_username as string | undefined) ??
      (tokenParsed?.email as string | undefined) ??
      "",
    nombre:
      (profile?.firstName as string | undefined) ??
      (tokenParsed?.given_name as string | undefined) ??
      "",
    apellido:
      (profile?.lastName as string | undefined) ??
      (tokenParsed?.family_name as string | undefined) ??
      "",
    rol: roles.includes("superadmin")
      ? "superadmin"
      : roles.includes("admin")
        ? "admin"
        : "user",
    habilitado: true,
    reporte: false,
    token: keycloak.token,
  }
}

export async function initKeycloakSession(): Promise<UserSession | null> {
  await initKeycloakOnce({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod:
      typeof window !== "undefined" && window.isSecureContext
        ? "S256"
        : undefined,
  })
  return buildUserSession()
}

export async function keycloakLogin(): Promise<void> {
  await keycloak.login()
}

export async function keycloakLogout(): Promise<void> {
  await keycloak.logout({
    redirectUri: window.location.origin,
  })
}

export async function keycloakChangePassword(): Promise<void> {
  await keycloak.accountManagement()
}