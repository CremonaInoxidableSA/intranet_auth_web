"use client"

import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { UserSession } from "@/lib/types"
import keycloak, { initKeycloakOnce } from "@/lib/keycloak"

interface AuthContextType {
  user: UserSession | null
  id: number | null
  email: string | null
  username: string | null
  nombre: string | null
  apellido: string | null
  rol: string | null
  habilitado: boolean | null
  reporte: boolean | null
  loading: boolean
  login: () => Promise<ApiResponse>
  logout: () => Promise<boolean>
}

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: string
  message?: string
}

const publicRoutes = [
  "/login",
  "/login/recuperacion",
  "/login/recuperacion/reset_pass",
  "/bootstrap",
]

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const [keycloakReady, setKeycloakReady] = useState(false)
  // Solo evita que ESTE componente dispare el efecto de init más de una vez.
  // La protección real contra doble-init vive en initKeycloakOnce (a nivel
  // de módulo), así que aunque este ref se resetee por un remount, no vamos
  // a volver a llamar a keycloak.init() sobre la misma instancia.
  const initTriggered = useRef(false)

  const isPublicRoute = useCallback(
    (route: string) =>
      publicRoutes.some(
        (publicRoute) =>
          route === publicRoute || route.startsWith(publicRoute + "/")
      ),
    []
  )

  const syncKeycloakSession = useCallback(async () => {
    if (!keycloak.authenticated) {
      setUser(null)
      return
    }

    let profile:
      | Awaited<ReturnType<typeof keycloak.loadUserProfile>>
      | undefined
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
      (tokenParsed?.realm_access as { roles?: string[] } | undefined)?.roles ??
      []

    const userToStore: UserSession = {
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

    setUser(userToStore)
  }, [])

  const initKeycloak = useCallback(async () => {
    setLoading(true)
    try {
      await initKeycloakOnce({
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod:
          typeof window !== "undefined" && window.isSecureContext
            ? "S256"
            : undefined,
      })
      setKeycloakReady(true)

      if (keycloak.authenticated) {
        await syncKeycloakSession()
      }
    } catch (error) {
      console.error("Keycloak init error", error)
      setKeycloakReady(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [syncKeycloakSession])

  // Redirige al login de Keycloak (no simplemente a /login) cuando no hay
  // sesión y la ruta no es pública. Usamos un ref para no disparar login()
  // más de una vez mientras el navegador está redirigiendo.
  const redirecting = useRef(false)

  useEffect(() => {
    if (loading || !keycloakReady) return

    if (isPublicRoute(pathname)) {
      if (user && pathname === "/login") {
        router.push("/")
      }
      return
    }

    if (!user && !keycloak.authenticated && !redirecting.current) {
      redirecting.current = true
      keycloak.login().catch((error) => {
        console.error("Error redirigiendo a Keycloak login", error)
        redirecting.current = false
      })
    }
  }, [user, loading, keycloakReady, pathname, router, isPublicRoute])

  useEffect(() => {
    if (!initTriggered.current) {
      initTriggered.current = true
      void initKeycloak()
    }
  }, [initKeycloak])

  const login = async (): Promise<ApiResponse> => {
    try {
      await keycloak.login()
      return { success: true }
    } catch (error) {
      console.error("Keycloak login error", error)
      return { success: false, error: "Error al iniciar sesión con Keycloak" }
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      await keycloak.logout({
        redirectUri: `${window.location.origin}/login`,
      })
    } catch (error) {
      console.error("Keycloak logout error", error)
    }

    setUser(null)
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        id: user?.id ?? null,
        email: user?.email ?? null,
        username: user?.username ?? null,
        nombre: user?.nombre ?? null,
        apellido: user?.apellido ?? null,
        habilitado: user ? !!user.habilitado : null,
        rol: user?.rol ?? null,
        reporte: user ? !!user.reporte : null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
