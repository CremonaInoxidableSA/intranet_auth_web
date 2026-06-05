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
import Cookies from "js-cookie"

interface AuthContextType {
  user: UserSession | null
  email: string | null
  username: string | null
  nombre: string | null
  apellido: string | null
  rol: string | null
  habilitado: boolean | null
  reporte: boolean | null
  loading: boolean
  login: (username: string, password: string) => Promise<ApiResponse>
  register: (data: RegisterData) => Promise<ApiResponse>
  logout: () => Promise<boolean>
}

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: string
  message?: string
}

interface RegisterData {
  email: string
  username: UserSession
  nombre: string
  apellido: string
  rol: "admin" | "user"
  habilitado: boolean
  reporte: boolean
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

let setupCheckInProgress = false

const SETUP_CACHE_KEY = "setup_check_cache"
const SETUP_CACHE_DURATION = 3600000

function getStoredSetupCache(): boolean | null {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(SETUP_CACHE_KEY)
    if (!cached) return null
    const { value, timestamp } = JSON.parse(cached)
    const now = Date.now()
    if (now - timestamp > SETUP_CACHE_DURATION) {
      localStorage.removeItem(SETUP_CACHE_KEY)
      return null
    }
    return value
  } catch {
    return null
  }
}

function setStoredSetupCache(value: boolean): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      SETUP_CACHE_KEY,
      JSON.stringify({
        value,
        timestamp: Date.now(),
      })
    )
  } catch (e) {
    console.warn("Could not store setup cache:", e)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [nombre, setNombre] = useState<string | null>(null)
  const [apellido, setApellido] = useState<string | null>(null)
  const [rol, setRol] = useState<string | null>(null)
  const [habilitado, setHabilitado] = useState<boolean | null>(null)
  const [reporte, setReporte] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const [needBootstrap, setNeedBootstrap] = useState(false)
  const sessionCheckCompleted = useRef(false)

  const checkSetupStatus = useCallback(async () => {
    const storedCache = getStoredSetupCache()

    if (storedCache !== null) {
      if (storedCache === false) {
        setNeedBootstrap(false)
      } else {
        setNeedBootstrap(true)
      }
      return
    }

    if (setupCheckInProgress) {
      return
    }

    setupCheckInProgress = true

    try {
      const res = await fetch(`/api/needs-setup`, {
        headers: {
          "Cache-Control": "max-age=3600",
        },
      })
      const data = await res.json()

      const needsSetup = data.needs_setup === true

      setStoredSetupCache(needsSetup)

      if (needsSetup) {
        setNeedBootstrap(true)
      } else {
        setNeedBootstrap(false)
      }
    } catch (err) {
      console.warn("Error checking setup status:", err)
      setStoredSetupCache(false)
      setNeedBootstrap(false)
    } finally {
      setupCheckInProgress = false
    }
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const setupCache = getStoredSetupCache()
      if (setupCache !== null) {
        if (setupCache === true) {
          setNeedBootstrap(true)
          setUser(null)
          setLoading(false)
          return
        } else {
          setNeedBootstrap(false)
        }
      } else {
        await checkSetupStatus()
      }

      const token =
        (typeof window !== "undefined" &&
          localStorage.getItem("access_token")) ||
        undefined

      let hydratedFromStorage = false
      let storedUserRaw: string | null = null
      if (typeof window !== "undefined") {
        storedUserRaw = localStorage.getItem("user")
        if (storedUserRaw) {
          try {
            const parsed = JSON.parse(storedUserRaw)
            setUser(parsed)
            hydratedFromStorage = true
          } catch (e) {
            console.warn("Failed to parse stored user", e)
          }
        }
      }

      const decodeToken = (t?: string) => {
        if (!t) return null
        try {
          const parts = t.split(".")
          if (parts.length < 2) return null
          const payload = parts[1]
          const b64 = payload.replace(/-/g, "+").replace(/_/g, "/")
          const json = decodeURIComponent(
            atob(b64)
              .split("")
              .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
              .join("")
          )
          const decoded = JSON.parse(json)
          return decoded
        } catch {
          return null
        }
      }

      if (hydratedFromStorage && token) {
        const payload = decodeToken(token)
        if (payload && payload.sub) {
          setNeedBootstrap(false)
          setLoading(false)
          return
        }
      }

      if (token && !hydratedFromStorage) {
        const payload = decodeToken(token)
        if (payload && payload.sub) {
          setUser({
            username: payload.sub,
            rol: payload.rol ?? undefined,
          } as UserSession)
          setLoading(false)
          return
        } else {
          setUser(null)
          setLoading(false)
          return
        }
      }

      if (!hydratedFromStorage || !token) {
        try {
          const res = await fetch(`/api/proxy/auth/check`, {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          })

          if (res.ok) {
            let data: {
              success?: boolean
              data?: { needBootstrap?: boolean; user?: unknown }
            } = {}
            try {
              data = await res.json()
            } catch {
              data = {}
            }

            if (data && data.success) {
              if (data.data && data.data.needBootstrap) {
                setNeedBootstrap(true)
                setUser(null)
                setLoading(false)
                return
              }

              if (data.data && data.data.user) {
                setNeedBootstrap(false)
                const incomingUser = data.data.user
                const normalized =
                  Array.isArray(incomingUser) && incomingUser.length > 0
                    ? incomingUser[0]
                    : incomingUser
                setUser(normalized)
                try {
                  if (typeof window !== "undefined")
                    localStorage.setItem("user", JSON.stringify(normalized))
                } catch (e) {
                  console.warn(
                    "Could not persist user from /check to localStorage",
                    e
                  )
                }
                setLoading(false)
                return
              }
            }
          }
        } catch (err) {
          console.warn("Error checking session with /check endpoint:", err)
        }
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [checkSetupStatus])

  useEffect(() => {
    if (!sessionCheckCompleted.current) {
      sessionCheckCompleted.current = true
      checkSession()
    }
  }, [checkSession])

  useEffect(() => {
    if (pathname === "/login" && needBootstrap && !loading) {
      const verifySetup = async () => {
        await checkSetupStatus()
      }
      verifySetup()
    }
  }, [pathname, needBootstrap, loading, checkSetupStatus])

  useEffect(() => {
    if (!loading) {
      if (!pathname) {
        return
      }

      const publicRoutes = [
        "/login",
        "/register",
        "/bootstrap",
        "/login/recuperacion",
        "/login/recuperacion/reset_pass",
      ]

      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
      )

      if (isPublicRoute) {
        return
      }

      if (needBootstrap && pathname !== "/bootstrap") {
        router.push("/bootstrap")
        return
      }

      if (!user && pathname !== "/") {
        router.push("/login")
      }

      if (user && (pathname === "/login" || pathname === "/register")) {
        router.push("/")
      }
    }
  }, [user, loading, needBootstrap, pathname, router])

  useEffect(() => {
    const syncUserState = () => {
      if (user) {
        setEmail(user.email ?? null)
        setUsername(user.username ?? null)
        setNombre(user.nombre ?? null)
        setApellido(user.apellido ?? null)
        setRol(user.rol ?? null)
        setHabilitado(!!user.habilitado)
        setReporte(!!user.reporte)
      } else {
        setEmail(null)
        setUsername(null)
        setNombre(null)
        setApellido(null)
        setRol(null)
        setHabilitado(null)
        setReporte(null)
      }
    }

    syncUserState()
  }, [user])

  const login = async (
    username: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const body = { username, password }

      const response = await fetch(`/api/proxy/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })

      let data: {
        access_token?: string
        token?: string
        data?: { token?: string; access_token?: string; user?: unknown }
        user?: unknown
        error?: string
        message?: string
      } = {}
      try {
        data = await response.json()
      } catch {
        if (!response.ok) {
          return {
            success: false,
            error: response.statusText || "Error en el login",
          }
        }
        return { success: false, error: "Respuesta inesperada del servidor" }
      }

      const token =
        data.access_token ??
        data.token ??
        data.data?.token ??
        data.data?.access_token

      if (token) {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", token)
            Cookies.set("access_token", token)
          }
        } catch (e) {
          console.warn("Could not store access_token in localStorage", e)
        }

        const decodeToken = (t: string) => {
          try {
            const parts = t.split(".")
            if (parts.length < 2) return null
            const payload = parts[1]
            const b64 = payload.replace(/-/g, "+").replace(/_/g, "/")
            const json = decodeURIComponent(
              atob(b64)
                .split("")
                .map(
                  (c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`
                )
                .join("")
            )
            return JSON.parse(json)
          } catch {
            return null
          }
        }

        const payload = decodeToken(token)
        if (payload && payload.sub) {
          setUser({
            username: payload.sub,
            rol: payload.rol ?? undefined,
          } as UserSession)
          try {
            if (typeof window !== "undefined")
              localStorage.setItem(
                "user",
                JSON.stringify({
                  username: payload.sub,
                  rol: payload.rol ?? undefined,
                  token,
                })
              )
          } catch (e) {
            console.warn("Could not store user in localStorage", e)
          }
        }

        const incomingUser = data.data?.user ?? data.user
        if (incomingUser) {
          const u = Array.isArray(incomingUser) ? incomingUser[0] : incomingUser
          const userToStore = { ...(u || {}), token }
          setUser(userToStore)
          try {
            if (typeof window !== "undefined")
              localStorage.setItem("user", JSON.stringify(userToStore))
          } catch (e) {
            console.warn("Could not store user in localStorage", e)
          }
        }

        setNeedBootstrap(false)
        if (token) {
          router.push(`/?token=${encodeURIComponent(token)}`)
        } else {
          router.push("/")
        }

        return { success: true, data }
      }

      return {
        success: false,
        error: data?.error ?? data?.message ?? "Login fallido",
      }
    } catch {
      return { success: false, error: "Error de conexión" }
    }
  }

  const register = async (): Promise<ApiResponse> => {
    return {
      success: false,
      error: "Registro no disponible. Contacte al administrador.",
    }
  }

  const clearAuthStorage = () => {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem(SETUP_CACHE_KEY)
      Cookies.remove("access_token")
      Cookies.remove("auth_token")
      Cookies.remove("accessToken")
    } catch (e) {
      console.warn("Could not remove tokens from storage", e)
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/proxy/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      let data: { success?: boolean } = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      setUser(null)
      clearAuthStorage()

      router.push("/login")

      return res.ok && (data.success ?? true)
    } catch {
      setUser(null)
      clearAuthStorage()
      router.push("/login")
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        username,
        nombre,
        apellido,
        habilitado,
        rol,
        reporte,
        loading,
        login,
        register,
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
