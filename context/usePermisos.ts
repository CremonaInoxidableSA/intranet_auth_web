"use client"
import { useMemo } from "react"
import { useAuth } from "@/context/AuthProvider"
import type { PermisoNombre } from "@/lib/permisos"

export function usePermisos() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () => new Set(user?.permisos?.map((p) => p.nombre) ?? []),
    [user?.permisos]
  )

  const tienePermiso = (nombre: PermisoNombre) => permisosSet.has(nombre)

  return { tienePermiso }
}
