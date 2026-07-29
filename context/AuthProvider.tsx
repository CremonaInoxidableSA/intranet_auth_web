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
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

import {
  initKeycloakSession,
  keycloakLogin,
  keycloakLogout,
} from "@/lib/keycloak/keycloakService"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const initTriggered = useRef(false)

  const parseStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === "string")
  }

  const getUserDetails = useCallback(async (): Promise<UserSession | null> => {
    const response = await fetchWithKeycloak("/api/personal/detalles", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const payload = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null

    if (!response.ok) {
      const serverMessage =
        typeof payload?.error === "string"
          ? payload.error
          : typeof payload?.detail === "string"
            ? payload.detail
            : typeof payload?.message === "string"
              ? payload.message
              : null

      throw new Error(
        serverMessage ??
          `No se pudo obtener la informacion del usuario (HTTP ${response.status})`
      )
    }

    const data =
      payload && typeof payload.data === "object" && payload.data !== null
        ? (payload.data as Record<string, unknown>)
        : payload

    if (!data) {
      throw new Error("La API de detalles devolvio una respuesta vacia")
    }

    const legajoValue = data.legajo
    const dniValue = data.dni

    const legajo =
      typeof legajoValue === "number"
        ? legajoValue
        : Number(legajoValue ?? Number.NaN)
    const dni =
      typeof dniValue === "number" ? dniValue : Number(dniValue ?? Number.NaN)

    if (!Number.isFinite(legajo) || !Number.isFinite(dni)) {
      throw new Error(
        "Respuesta invalida en /api/personal/detalles: faltan legajo o dni"
      )
    }

    const email = typeof data.email === "string" ? data.email : ""

    return {
      id: legajo,
      username:
        typeof data.username === "string"
          ? data.username
          : email.includes("@")
            ? email.split("@")[0]
            : undefined,
      email,
      nombre: typeof data.nombre === "string" ? data.nombre : "",
      apellido: typeof data.apellido === "string" ? data.apellido : "",
      legajo,
      dni,
      grupos: parseStringArray(data.grupos),
      modulos: parseStringArray(data.modulos),
      submodulos: parseStringArray(data.submodulos),
      permisos: parseStringArray(data.permisos),
    }
  }, [])

  const initKeycloak = useCallback(async () => {
    setLoading(true)

    try {
      const authenticated = await initKeycloakSession()

      if (!authenticated) {
        setUser(null)
        return
      }

      const userDetails = await getUserDetails()
      setUser(userDetails)
    } catch (error) {
      console.error(error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [getUserDetails])

  useEffect(() => {
    if (!initTriggered.current) {
      initTriggered.current = true
      void initKeycloak()
    }
  }, [initKeycloak])

  const login = async (): Promise<ApiResponse> => {
    try {
      setLoading(true)
      await keycloakLogin()
      return { success: true }
    } catch (error) {
      setLoading(false)
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
        id: user?.id ?? user?.legajo ?? null,
        email: user?.email ?? null,
        username: user?.username ?? null,
        nombre: user?.nombre ?? null,
        apellido: user?.apellido ?? null,
        legajo: user?.legajo ?? null,
        dni: user?.dni ?? null,

        grupos: user?.grupos ?? [],
        modulos: user?.modulos ?? [],
        submodulos: user?.submodulos ?? [],
        permisos: user?.permisos ?? [],

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
