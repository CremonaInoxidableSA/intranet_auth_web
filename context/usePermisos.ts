"use client"
import { useAutorizacion } from "@/context/useAutorizacion"

export function usePermisos() {
  const { tienePermiso } = useAutorizacion()
  return { tienePermiso }
}

export function useSubmodulos() {
  const { tieneAccesoSubmodulo } = useAutorizacion()
  return { tieneAcceso: tieneAccesoSubmodulo }
}
