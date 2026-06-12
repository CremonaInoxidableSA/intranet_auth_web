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
      // 1. Verificar bootstrap
      const setupCache = getStoredSetupCache()
      if (setupCache === true) {
        setNeedBootstrap(true)
        setUser(null)
        return
      }
      if (setupCache === null) {
        await checkSetupStatus()
      }

      // 2. Leer token: primero localStorage, luego cookie como fallback
      let token: string | undefined
      if (typeof window !== "undefined") {
        token =
          localStorage.getItem("access_token") ??
          document.cookie
            .split("; ")
            .find((c) => c.startsWith("access_token="))
            ?.split("=")[1] ??
          undefined
        // Si vino de cookie pero no estaba en localStorage, sincronizar
        if (token && !localStorage.getItem("access_token")) {
          localStorage.setItem("access_token", token)
        }
      }

      if (!token) {
        setUser(null)
        return
      }

      // 3. Verificar que el token no esté expirado
      const isTokenValid = (t: string): boolean => {
        try {
          const b64 = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
          const payload = JSON.parse(
            decodeURIComponent(
              atob(b64)
                .split("")
                .map(
                  (c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`
                )
                .join("")
            )
          )
          if (!payload?.sub) return false
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
            return false
          return true
        } catch {
          return false
        }
      }

      if (!isTokenValid(token)) {
        // Token expirado o inválido — limpiar y forzar re-login
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        setUser(null)
        return
      }

      // 4. Hidratar usuario desde localStorage (evita un fetch innecesario)
      const storedUserRaw = localStorage.getItem("user")
      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw)
          if (parsed?.username) {
            setUser(parsed)
            setNeedBootstrap(false)
            return
          }
        } catch {
          // JSON corrupto, continuar al fetch
        }
      }

      // 5. Fallback: pedir el usuario al backend
      try {
        const res = await fetch(`/api/proxy/auth/check`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json().catch(() => ({}))
          if (data?.success && data?.data?.user) {
            const incomingUser = data.data.user
            const normalized = Array.isArray(incomingUser)
              ? incomingUser[0]
              : incomingUser
            setUser(normalized)
            setNeedBootstrap(false)
            try {
              localStorage.setItem("user", JSON.stringify(normalized))
            } catch {}
            return
          }
        }
      } catch (err) {
        console.warn("Error en /check:", err)
      }

      // Si llegamos acá sin usuario, limpiar
      setUser(null)
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
        // Guardar token en localStorage (para authFetch).
        // La cookie la setea el backend en su respuesta y el proxy route.ts la propaga.
        try {
          localStorage.setItem("access_token", token)
        } catch (e) {
          console.warn("Could not store access_token", e)
        }

        // El backend devuelve { success, data: { token, user } }
        // Usar el objeto user completo de la respuesta
        const incomingUser = data.data?.user ?? data.user
        if (incomingUser) {
          const u = Array.isArray(incomingUser) ? incomingUser[0] : incomingUser
          const userToStore = { ...(u || {}), token }
          setUser(userToStore)
          try {
            localStorage.setItem("user", JSON.stringify(userToStore))
          } catch (e) {
            console.warn("Could not store user in localStorage", e)
          }
        }

        setNeedBootstrap(false)
        // window.location.href fuerza un request HTTP completo al servidor
        // para que la cookie seteada por el backend (propagada por el proxy)
        // sea enviada en el siguiente request.
        window.location.href = "/"

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
