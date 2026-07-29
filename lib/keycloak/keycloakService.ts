import keycloak, { initKeycloakOnce } from "@/lib/keycloak/keycloak"
export async function initKeycloakSession(): Promise<boolean> {
  const authenticated = await initKeycloakOnce({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod:
      typeof window !== "undefined" && window.isSecureContext
        ? "S256"
        : undefined,
  })
  return authenticated
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
