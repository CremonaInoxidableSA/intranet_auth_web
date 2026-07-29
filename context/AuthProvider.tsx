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
import { AuthContextType, ApiResponse } from "@/types/types"
import {
  buildUserSession,
  initKeycloakSession,
  keycloakLogin,
  keycloakLogout,
  keycloakChangePassword,
} from "@/lib/keycloak/keycloakService"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const initTriggered = useRef(false)

  const syncKeycloakSession = useCallback(async () => {
    const userSession = await buildUserSession()
    setUser(userSession)
  }, [])

  const initKeycloak = useCallback(async () => {
    setLoading(true)
    try {
      const userSession = await initKeycloakSession()
      setUser(userSession)
    } catch (error) {
      console.error("Keycloak init error", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initTriggered.current) {
      initTriggered.current = true
      void initKeycloak()
    }
  }, [initKeycloak])

  const login = async (): Promise<ApiResponse> => {
    try {
      await keycloakLogin()
      return { success: true }
    } catch (error) {
      console.error("Keycloak login error", error)
      return { success: false, error: "Error al iniciar sesión con Keycloak" }
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      await keycloakLogout()
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
        id: user?.id ? String(user.id) : null,
        email: user?.email ?? null,
        username: user?.username ?? null,
        nombre: user?.nombre ?? null,
        apellido: user?.apellido ?? null,
        roles: user ? [user?.rol ?? "user"] : [],
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
