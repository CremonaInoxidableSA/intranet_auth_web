import Keycloak from "keycloak-js"

const keycloak = new Keycloak({
  url:
    process.env.NEXT_PUBLIC_KEYCLOAK_URL ??
    "https://login.intranetcreminox.com",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "internos",
  clientId:
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "internos-login-prueba3",
})

let initPromise: Promise<boolean> | null = null

export function initKeycloakOnce(
  options: Keycloak.KeycloakInitOptions
): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init(options).catch((error) => {
      initPromise = null
      throw error
    })
  }
  return initPromise
}

export default keycloak
