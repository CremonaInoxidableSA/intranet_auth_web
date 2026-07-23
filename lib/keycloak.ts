import Keycloak from "keycloak-js"

const keycloak = new Keycloak({
  url:
    process.env.NEXT_PUBLIC_KEYCLOAK_URL ??
    "https://login.intranetcreminox.com",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "internos",
  clientId:
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "internos-login-prueba",
})

// Guard a nivel de módulo: sobrevive a remounts del componente (Strict Mode,
// Fast Refresh, error boundaries, etc). Si dejamos este guard dentro de un
// useRef del componente, un remount vuelve a llamar a keycloak.init() sobre
// la MISMA instancia, y Keycloak tira "A 'Keycloak' instance can only be
// initialized once" -> si ese error resetea el flag, se entra en loop.
let initPromise: Promise<boolean> | null = null

export function initKeycloakOnce(
  options: Keycloak.KeycloakInitOptions
): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init(options).catch((error) => {
      // Si falla la inicialización "real" (no por doble-init), liberamos
      // el guard para permitir un reintento genuino más adelante.
      initPromise = null
      throw error
    })
  }
  return initPromise
}

export default keycloak
