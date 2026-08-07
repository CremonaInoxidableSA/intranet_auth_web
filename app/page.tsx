"use client"

import type { ComponentType } from "react"
import {
  CircleHelp,
  KeyRound,
  LayoutGrid,
  ShieldCheck,
  User,
  type LucideProps,
  icons as lucideIcons,
} from "lucide-react"
import { IoIosCloudDone } from "react-icons/io"
import { MdOutlineFactory } from "react-icons/md"
import { SiAutodesk } from "react-icons/si"
import { useAuth } from "@/context/AuthProvider"

const fallbackIcons: Record<string, ComponentType<LucideProps>> = {
  Auth: ShieldCheck,
  Dashboard: LayoutGrid,
  Key: KeyRound,
  User,
}

const reactIconsMap: Record<string, ComponentType<{ className?: string }>> = {
  IoIosCloudDone,
  MdOutlineFactory,
  SiAutodesk,
}

const MODULOS_OCULTOS_HOME = new Set(["MODULO_AUTH"])

const toAbsoluteUrl = (path: string) => {
  if (!path) {
    return "#"
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return `https://${path}`
}

const resolveIcon = (iconName: string) => {
  const fromReactIcons = reactIconsMap[iconName]

  if (fromReactIcons) {
    return fromReactIcons
  }

  const fromFallback = fallbackIcons[iconName]

  if (fromFallback) {
    return fromFallback
  }

  const lucideIcon = lucideIcons[iconName as keyof typeof lucideIcons]

  return lucideIcon ?? CircleHelp
}

const toTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

export default function Page() {
  const { user } = useAuth()

  const sistemas = Object.entries(user?.modulos_personales ?? {})
    .filter(([nombre]) => !MODULOS_OCULTOS_HOME.has(nombre))
    .map(([nombre, modulo]) => ({
      titulo: toTitle(nombre),
      url: toAbsoluteUrl(modulo.path),
      Icon: resolveIcon(modulo.icono),
    }))

  const midIndex = Math.ceil(sistemas.length / 2)
  const firstRow = sistemas.slice(0, midIndex)
  const secondRow = sistemas.slice(midIndex)

  const renderRow = (items: typeof sistemas) => (
    <div className="flex w-full flex-wrap items-center justify-center gap-5">
      {items.map((sistema) => {
        const Icon = sistema.Icon
        return (
          <a
            key={sistema.titulo}
            href={sistema.url}
            className="flex h-[15vw] max-h-55 min-h-35 w-[15vw] max-w-55 min-w-35 cursor-pointer flex-col items-center justify-center gap-3 rounded border-none bg-background2 p-4 font-semibold text-[#5d5d5d] transition-colors duration-200 ease-in-out hover:text-[#e82a31]"
          >
            <Icon className="flex h-full w-full items-center justify-center text-[#5d5d5d]" />
            <span className="text-sm">{sistema.titulo}</span>
          </a>
        )
      })}
    </div>
  )

  return (
    <div className="flex w-full flex-col items-center gap-5 p-5 text-center font-medium">
      <p className="max-w-3xl text-base leading-7">
        Hola, bienvenido a la Sistema General de Cremona Inoxidable S.A. Desde
        acá podés acceder a los siguientes sistemas:
      </p>
      {sistemas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No tenes modulos personales asignados.
        </p>
      )}
      {renderRow(firstRow)}
      {secondRow.length > 0 && renderRow(secondRow)}
    </div>
  )
}
