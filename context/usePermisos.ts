"use client"
import { useMemo } from "react"
import { useAuth } from "@/context/AuthProvider"
import type { PermisoNombre } from "@/lib/permisos"
import { SubmoduloNombre } from "@/lib/modulos";

export function usePermisos() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () => new Set(user?.permisos?.map((p) => p.nombre) ?? []),
    [user?.permisos]
  )

  const tienePermiso = (nombre: PermisoNombre) => permisosSet.has(nombre)

  return { tienePermiso }
}

export function useSubmodulos() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () => new Set(user?.submodulos?.map((p) => p.nombre) ?? []),
    [user?.submodulos]
  )

  const tieneAcceso = (nombre: SubmoduloNombre) => permisosSet.has(nombre)

  return { tieneAcceso }
}
