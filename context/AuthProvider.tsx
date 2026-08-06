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

import {
  AuthContextType,
  OperacionResponse,
  UsersData,
  PermisosData,
  SubmodulosData,
  ModulosData,
  GruposData,
} from "@/types/types"

import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

import {
  initKeycloakSession,
  keycloakLogin,
  keycloakLogout,
} from "@/lib/keycloak/keycloakService"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsersData | null>(null)
  const [loading, setLoading] = useState(true)

  const initTriggered = useRef(false)

  const parseStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === "string")
  }

  const getUserDetails = useCallback(async (): Promise<UsersData> => {
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
          `No se pudo obtener la información del usuario (HTTP ${response.status})`
      )
    }

    const data =
      payload && typeof payload.data === "object" && payload.data !== null
        ? (payload.data as Record<string, unknown>)
        : payload

    if (!data) {
      throw new Error("La API devolvió una respuesta vacía")
    }

    const legajo =
      typeof data.legajo === "number"
        ? data.legajo
        : Number(data.legajo ?? Number.NaN)

    const dni =
      typeof data.dni === "number" ? data.dni : Number(data.dni ?? Number.NaN)

    if (!Number.isFinite(legajo) || !Number.isFinite(dni)) {
      throw new Error(
        "Respuesta inválida en /api/personal/detalles: faltan legajo o dni"
      )
    }

    return {
      email: typeof data.email === "string" ? data.email : "",
      nombre: typeof data.nombre === "string" ? data.nombre : "",
      apellido: typeof data.apellido === "string" ? data.apellido : "",
      legajo,
      dni,

      grupos: Array.isArray(data.grupos) ? (data.grupos as GruposData[]) : [],

      modulos: Array.isArray(data.modulos)
        ? (data.modulos as ModulosData[])
        : [],

      submodulos: Array.isArray(data.submodulos)
        ? (data.submodulos as SubmodulosData[])
        : [],

      permisos: Array.isArray(data.permisos)
        ? (data.permisos as PermisosData[])
        : [],

      id: typeof data.id === "string" ? data.id : "",
      habilitado:
        typeof data.habilitado === "boolean" ? data.habilitado : false,
      apellidoNombre:
        typeof data.apellidoNombre === "string" ? data.apellidoNombre : "",
      cambiar_password:
        typeof data.cambiar_password === "boolean"
          ? data.cambiar_password
          : false,
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

  const login = async (): Promise<OperacionResponse> => {
    try {
      setLoading(true)
      await keycloakLogin()

      return { detail: "Login successful" }
    } catch (error) {
      console.error("Keycloak login error", error)
      setLoading(false)

      return {
        detail: "Error al iniciar sesión con Keycloak",
      }
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

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
