"use client"
import { useMemo } from "react"
import { useAuth } from "@/context/AuthProvider"
import type { Autorizacion } from "@/lib/permisos"
import { SubmoduloData } from "@/types/types"

export function usePermisos() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () => new Set(user?.permisos?.map((p) => p.nombre) ?? []),
    [user?.permisos]
  )

  const tienePermiso = (nombre: Autorizacion) => permisosSet.has(nombre)

  return { tienePermiso }
}

export function useSubmodulos() {
  const { user } = useAuth()

  const permisosSet = useMemo(
    () => new Set(user?.submodulos?.map((p) => p.nombre) ?? []),
    [user?.submodulos]
  )

  const tieneAcceso = (nombre: SubmoduloData) => permisosSet.has(nombre)

  return { tieneAcceso }
}
