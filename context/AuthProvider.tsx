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
  login: (username: string, password: string) => Promise<ApiResponse>
  logout: () => Promise<boolean>
}

interface ApiResponse {
  success: boolean
  data?: unknown
  error?: string
  message?: string
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
    if (Date.now() - timestamp > SETUP_CACHE_DURATION) {
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
  localStorage.setItem(
    SETUP_CACHE_KEY,
    JSON.stringify({ value, timestamp: Date.now() })
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<number | null>(null)
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
      setNeedBootstrap(storedCache)
      return
    }
    if (setupCheckInProgress) return
    setupCheckInProgress = true
    try {
      const res = await fetch(`/api/bootstrap/needs-setup`)
      const data = await res.json()
      const needsSetup = data.needs_setup === true
      setStoredSetupCache(needsSetup)
      setNeedBootstrap(needsSetup)
    } catch {
      setStoredSetupCache(false)
      setNeedBootstrap(false)
    } finally {
      setupCheckInProgress = false
    }
  }, [])

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null
    let token = localStorage.getItem("access_token")
    if (!token) {
      token =
        document.cookie
          .split("; ")
          .find((c) => c.startsWith("access_token="))
          ?.split("=")[1] ?? null
      if (token) localStorage.setItem("access_token", token)
    }
    return token
  }, [])

  const isTokenValid = useCallback((token: string): boolean => {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) return false
      const payload = JSON.parse(atob(parts[1]))
      if (!payload.sub) return false
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
        return false
      return true
    } catch {
      return false
    }
  }, [])

  const checkSession = useCallback(async () => {
    try {
      const setupCache = getStoredSetupCache()
      if (setupCache === true) {
        setNeedBootstrap(true)
        setUser(null)
        setLoading(false)
        return
      }
      if (setupCache === null) {
        await checkSetupStatus()
      }

      const token = getToken()
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      if (!isTokenValid(token)) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        setUser(null)
        setLoading(false)
        return
      }

      const storedUserRaw = localStorage.getItem("user")
      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw)
          if (parsed?.username) {
            setUser(parsed)
            setNeedBootstrap(false)
            setLoading(false)
            return
          }
        } catch {}
      }

      try {
        const res = await fetch(`/api/auth/check`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.success && data?.data?.user) {
            const userData = data.data.user
            const userToStore = { ...userData, token }
            setUser(userToStore)
            localStorage.setItem("user", JSON.stringify(userToStore))
            setNeedBootstrap(false)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.warn("Error en check:", err)
      }

      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      setUser(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [checkSetupStatus, getToken, isTokenValid])

  useEffect(() => {
    if (!sessionCheckCompleted.current) {
      sessionCheckCompleted.current = true
      checkSession()
    }
  }, [checkSession])

  useEffect(() => {
    if (pathname === "/login" && needBootstrap && !loading) {
      checkSetupStatus()
    }
  }, [pathname, needBootstrap, loading, checkSetupStatus])

  useEffect(() => {
    if (!loading) {
      const publicRoutes = [
        "/login",
        "/bootstrap",
        "/login/recuperacion",
        "/login/recuperacion/reset_pass",
      ]
      const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
      )
      if (isPublicRoute) return

      if (needBootstrap && pathname !== "/bootstrap") {
        router.push("/bootstrap")
        return
      }
      if (!user) {
        router.push("/login")
        return
      }
      if (user && (pathname === "/login")) {
        router.push("/")
      }
    }
  }, [user, loading, needBootstrap, pathname, router])

  useEffect(() => {
    if (user) {
      setId(user.id ?? null)
      setEmail(user.email ?? null)
      setUsername(user.username ?? null)
      setNombre(user.nombre ?? null)
      setApellido(user.apellido ?? null)
      setRol(user.rol ?? null)
      setHabilitado(!!user.habilitado)
      setReporte(!!user.reporte)
    } else {
      setId(null)
      setEmail(null)
      setUsername(null)
      setNombre(null)
      setApellido(null)
      setRol(null)
      setHabilitado(null)
      setReporte(null)
    }
  }, [user])

  const login = async (
    username: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.message || "Error en el login" }
      }

      const { token, user } = data.data

      localStorage.setItem("access_token", token)
      const isSecure = process.env.NODE_ENV === "production"
      document.cookie = `access_token=${token}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`
      const userToStore = { ...user, token }
      localStorage.setItem("user", JSON.stringify(userToStore))
      setUser(userToStore)
      setNeedBootstrap(false)

      window.location.href = "/"

      return { success: true, data }
    } catch {
      return { success: false, error: "Error de conexión" }
    }
  }

  const logout = async (): Promise<boolean> => {
    try {
      await fetch(`/api/auth/logout`, { method: "POST" })
    } catch {}
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setUser(null)
    router.push("/login")
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        id,
        email,
        username,
        nombre,
        apellido,
        habilitado,
        rol,
        reporte,
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
