import { urlConfig } from "@/lib/config"
import { type LucideProps, CircleHelp } from "lucide-react"
import { type ComponentType } from "react"
import { icons as lucideIcons } from "lucide-react"
import { type ModulosPersonales } from "@/types/types"
import { type SubmodulosPersonales } from "@/types/types"

const fallbackIcon: ComponentType<LucideProps> = CircleHelp

const resolveIcon = (iconName: string) => {
  const lucideIcon = lucideIcons[iconName as keyof typeof lucideIcons]
  return lucideIcon ?? fallbackIcon
}

const toTitle = (value: string) =>
  value
    .replace(/^MODULO_/, "")
    .replace(/_/g, " ")
    .toUpperCase()

const normalizeUrl = (url: string): string => {
  if (url.startsWith("/")) {
    return url
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

export interface SubmoduloItem {
  nombre: string
  titulo: string
  path: string
  Icon?: ComponentType<LucideProps>
  isSpecial?: boolean
}

export const getUnifiedSubmodulos = (
  userSubmodulos: SubmodulosPersonales = {},
  tieneAcceso: (nombre: string) => boolean,
  includeIcons: boolean = false,
  includeSpecial: boolean = true
): SubmoduloItem[] => {
  const items: SubmoduloItem[] = []

  // Agregar Home al inicio si se especifica
  if (includeSpecial) {
    items.push({
      nombre: "HOME",
      titulo: "HOME",
      path: normalizeUrl(urlConfig.homeUrl),
      Icon: includeIcons ? resolveIcon("Home") : undefined,
      isSpecial: true,
    })
  }

  // Agregar submodulos del usuario, filtrados y ordenados alfabéticamente
  const usuarioSubmodulos = Object.entries(userSubmodulos ?? {})
    .filter(([nombre]) => tieneAcceso(nombre))
    .map(([nombre, submodulo]) => ({
      nombre,
      titulo: toTitle(nombre),
      path: normalizeUrl(submodulo.path),
      Icon: includeIcons ? resolveIcon(submodulo.icono) : undefined,
      isSpecial: false,
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo))

  items.push(...usuarioSubmodulos)

  if (includeSpecial) {
    items.push({
      nombre: "TICKETS_SOPORTE",
      titulo: "TICKETS SOPORTE",
      path: normalizeUrl(urlConfig.ticketsUrl),
      Icon: includeIcons ? resolveIcon("Ticket") : undefined,
      isSpecial: true,
    })
  }

  return items
}

const MODULOS_OCULTOS_HOME = new Set(["MODULO_AUTH"])

export interface ModuloItem {
  nombre: string
  titulo: string
  path: string
  Icon?: ComponentType<LucideProps>
  isSpecial?: boolean
}

export const getModulosPersonales = (
  userModulos: ModulosPersonales = {},
  includeIcons: boolean = true
): ModuloItem[] => {
  return Object.entries(userModulos ?? {})
    .filter(([nombre]) => !MODULOS_OCULTOS_HOME.has(nombre))
    .map(([nombre, modulo]) => ({
      nombre,
      titulo: toTitle(nombre),
      path: normalizeUrl(modulo.path),
      Icon: includeIcons ? resolveIcon(modulo.icono) : undefined,
      isSpecial: false,
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo))
}
