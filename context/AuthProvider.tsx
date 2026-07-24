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
import { UserSession } from "@/types/types"
import keycloak, { initKeycloakOnce } from "@/lib/keycloak"
import { AuthContextType, ApiResponse } from "@/types/types"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const initTriggered = useRef(false)

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
        onLoad: "login-required",
        checkLoginIframe: false,
        pkceMethod:
          typeof window !== "undefined" && window.isSecureContext
            ? "S256"
            : undefined,
      })
      await syncKeycloakSession()
    } catch (error) {
      console.error("Keycloak init error", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [syncKeycloakSession])

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
        redirectUri: window.location.origin,
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
